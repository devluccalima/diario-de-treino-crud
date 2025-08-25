import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function Rotinas() {
    const [rotinas, setRotinas] = useState([]);
    const [nomeRotina, setNomeRotina] = useState('');
    const [diaSemana, setDiaSemana] = useState('');
    const [loading, setLoading] = useState(true);
    const [RotinaSelect, setRotinaSelect] = useState(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [resultadosBusca, setResultadosBusca] = useState([]);
    


    // Função para buscar as rotinas da nossa API
    const fetchRotinas = () => {
        fetch('http://127.0.0.1:5000/api/rotinas')
            .then(res => res.json())
            .then(data => {
                setRotinas(data);
                setLoading(false);
            })
            .catch(error => console.error("Erro ao buscar rotinas:", error));
    };

    useEffect(() => {
        fetchRotinas();
    }, []);

    const handleAddRotina = (e) => {
        e.preventDefault();
        const novaRotina = { nome: nomeRotina, dia_da_semana: diaSemana };
        fetch('http://127.0.0.1:5000/api/rotinas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaRotina)
        })
            .then(res => res.json())
            .then(data => {
                setRotinas([...rotinas, data]);
                setNomeRotina('');
                setDiaSemana('');
            })
            .catch(error => console.error("Erro ao adicionar rotina:", error));
    };

    const handleBuscaSubmit = (e) => {
        e.preventDefault();
        if (!termoBusca) return; // Não busca se o campo estiver vazio
      
        // Este é o endpoint de BUSCA da WGER. Note o "?term="
        const apiUrl = `https://wger.de/api/v2/exercise/search/?term=${termoBusca}&language=7`;
      
        fetch(apiUrl)
          .then(res => res.json())
          .then(data => {
            console.log("Resultados da busca:", data);
            // A API de busca da WGER retorna os resultados dentro de uma chave chamada "suggestions"
            setResultadosBusca(data.suggestions); 
          })
          .catch(error => console.error("Erro na busca:", error));
      };

    if (loading) {
        return <div>Carregando rotinas...</div>;
    }

    if (RotinaSelect) { // Lembre-se de usar o nome correto da sua variável de estado
        return (
          <div>
            <button onClick={() => setRotinaSelect(null)} style={{ marginBottom: '16px' }}>
              <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
              Voltar para todas as rotinas
            </button>
            <h2>{RotinaSelect.nome}</h2>
            <p>Dia da semana: {RotinaSelect.dia_da_semana}</p>
            <hr />
      
            <h3>Exercícios nesta Rotina:</h3>
            <p>Nenhum exercício adicionado ainda.</p>
            
            <hr style={{ marginTop: '24px' }}/>
      
            <h3>Adicionar Exercício da Biblioteca</h3>
            <form onSubmit={handleBuscaSubmit}>
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Buscar exercício (ex: Supino)"
              />
              <button type="submit">Buscar</button>
            </form>
      
            {/* Lista de Resultados da Busca */}
            <ul className="search-results">
              {resultadosBusca.map(item => (
                <li key={item.data.id}>
                  <span>{item.value}</span>
                  <button>+</button>
                </li>
              ))}
            </ul>
          </div>
        );
      }

    return (
        <div>
            <h2>Minhas Rotinas</h2>
            <form onSubmit={handleAddRotina}>
                {/* ... seu formulário de adicionar rotina continua aqui ... */}
                <input
                    type="text"
                    value={nomeRotina}
                    onChange={(e) => setNomeRotina(e.target.value)}
                    placeholder="Nome da Rotina (ex: Treino A)"
                    required
                />
                <input
                    type="text"
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(e.target.value)}
                    placeholder="Dia da Semana (ex: Segunda-Feira)"
                    required
                />
                <button type="submit">Criar Rotina</button>
            </form>
            <hr />
            <ul>
                {/* A sua lista de rotinas clicável que acabámos de modificar */}
                {rotinas.map(rotina => (
                    <li key={rotina.id} onClick={() => setRotinaSelect(rotina)} style={{ cursor: 'pointer', padding: '8px' }}>
                        <strong>{rotina.nome}</strong> - {rotina.dia_da_semana}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Rotinas;