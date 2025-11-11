// verificador_dependencias.js
const db = require('./conexaobd'); // importa a conexão


let tabelas = [];
let colunas = [];
let argumentos = [];
let dependenciasEncontradas = [];

//pega as tabelas do bd
async function pegarTabelas(){
    const sql = `SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'`;
    try {
        const res = await db.query(sql);
        tabelas = res.rows.map(t => t.table_name);
        console.log('Tabelas:', tabelas);
        return tabelas;
    } catch (err) {
        console.error('Erro ao pegar tabelas:', err);
        return [];
    }
}

//Cria o query para pegar as colunas da tabela no bd 
function criarQueryColunasTabela(tabela){
    const sql = `SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = '${tabela}'`;
    return sql;
}

//pega as colunas da tabela no bd
async function pegarColunasTabela(sql){
    try {
        const res = await db.query(sql);
        colunas = res.rows.map(c => c.column_name);
        console.log('Colunas:', colunas);
        return colunas;
    } catch (err) {
        console.error('Erro ao pegar colunas:', err);
        return [];
    }
}

//Gera todas as combinações possíveis de um array dado um tamanho
function gerarCombinacoes(array, tamanho) {
    if (tamanho === 0) return [[]];
    if (tamanho > array.length) return [];
    if (array.length === 0) return [];
    const [primeiro, ...resto] = array;
    const comPrimeiro = gerarCombinacoes(resto, tamanho - 1).map(c => [primeiro, ...c]);
    const semPrimeiro = gerarCombinacoes(resto, tamanho);
    
    return [...comPrimeiro, ...semPrimeiro];
}

//Gera os argumentos para o verificador de dependências funcionais
function gerarArgumentos(colunas){
    argumentos = [];

    colunas.forEach(argR => {
        let colunasRestantes = colunas.filter(c => c !== argR);
        for(let tamanhoComb = 1; tamanhoComb < colunas.length; tamanhoComb++){
            let combinacoes = gerarCombinacoes(colunasRestantes, tamanhoComb);
            combinacoes.forEach(comb => {
                argumentos.push({argL: comb, argR});
            });
        }
    });
    return argumentos;
}

//Gera a query para o verificador de dependências funcionais
function gerarQueryVerificador(argL, argR, tabela){
    const sql = `
        SELECT ${argL.join(', ')}, COUNT(DISTINCT ${argR}) as qtd
        FROM ${tabela}
        GROUP BY ${argL.join(', ')}
        HAVING COUNT(DISTINCT ${argR}) > 1;
    `;
    return sql;
}

//Executa a query do verificador de dependências funcionais
async function executarQueryVerificador(sql){
    try {
        const res = await db.query(sql);
        return res.rows;
    } catch (err) {
        console.error('Erro ao executar query verificador:', err);
        return [];
    }
}

//Verifica se não tem dependências repetidas
function registrarDependencia(tabela, argL, argR){
    if(argL.length === 1 && argL[0] === argR) return;

    const inversaExiste = dependenciasEncontradas.some(dep =>
        dep.tabela === tabela &&
        JSON.stringify(dep.argL) === JSON.stringify([argR]) &&
        JSON.stringify(dep.argR) === JSON.stringify(argL)
    );
    if (inversaExiste) return;

    const igualExiste = dependenciasEncontradas.some(dep =>
        dep.tabela === tabela && 
        JSON.stringify(dep.argL) === JSON.stringify(argL) &&
        JSON.stringify(dep.argR) === JSON.stringify([argR])
    );
    if(igualExiste) return;

    dependenciasEncontradas.push({tabela, argL, argR: [argR]});
    console.log(`Dependência funcional na tabela ${tabela}: ${argL.join(', ')} -> ${argR}`);
}

//Verifica as dependências funcionais por tabela
async function verificarPorTabela() {
    const tabelas = await pegarTabelas();

    for (const tabela of tabelas) {
        const sqlColunas = criarQueryColunasTabela(tabela);
        const colunas = await pegarColunasTabela(sqlColunas);
        const argumentos = gerarArgumentos(colunas);

        for (const arg of argumentos) {
            const sqlVerificador = gerarQueryVerificador(arg.argL, arg.argR, tabela);
            const resultado = await executarQueryVerificador(sqlVerificador);

            if (resultado && resultado.length === 0) {
                    registrarDependencia(tabela, arg.argL, arg.argR);
            }
        }
    }
    db.end();
}


verificarPorTabela();