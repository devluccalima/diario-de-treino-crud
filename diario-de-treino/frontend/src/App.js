import { useState, useEffect } from 'react';
import './App.css'
import ApiExplorer from './ApiExplores';

function App() {

  const [exercicios, setExercicios] = useState([]);
  // Estados para o formulário de ADICIONAR
  const [nome, setNome] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [series, setSeries] = useState('');
  const [peso, setPeso] = useState('');
  // Estados para a funcionalidade de EDITAR
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: '', repeticoes: '', series: '', peso: '' });
  // Estado para o modal de DELETAR
  const [itemParaDeletar, setItemParaDeletar] = useState(null);
  const [showSucessModal, setShowSucessModal] = useState(false);

  // --- BUSCA INICIAL DOS DADOS ---
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/exercicios')
      .then(response => response.json())
      .then(data => setExercicios(data))
      .catch(error => console.error('Erro ao buscar dados:', error));
  }, []);

  // --- FUNÇÕES DE LÓGICA (HANDLERS) ---

  // Para o formulário de ADICIONAR
  const handleSubmit = (e) => {
    e.preventDefault();
    const novoExercicio = { nome, series: parseInt(series), repeticoes: parseInt(repeticoes), peso: parseFloat(peso) };
    fetch('http://127.0.0.1:5000/api/exercicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoExercicio)
    })
      .then(response => response.json())
      .then(() => {
        // Refaz a busca para pegar a lista atualizada
        fetch('http://127.0.0.1:5000/api/exercicios')
          .then(res => res.json())
          .then(dadosAtualizados => setExercicios(dadosAtualizados));
        setShowSucessModal(true); // Mostra o modal de sucesso
        // Limpa os campos do formulário de adicionar
        setNome(''); setRepeticoes(''); setSeries(''); setPeso('');
      })
      .catch(error => console.error('Erro ao adicionar exercício:', error));
  };

  // Para o formulário de EDITAR (Inputs)
  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Para o formulário de EDITAR (Salvar)
  const handleUpdateSubmit = (event) => {
    event.preventDefault();
    const dadosAtualizados = {
      nome: editFormData.nome,
      series: parseInt(editFormData.series),
      repeticoes: parseInt(editFormData.repeticoes),
      peso: parseFloat(editFormData.peso)
    };
    
    fetch(`http://127.0.0.1:5000/api/exercicios/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados)
    })
      .then(res => res.json())
      .then(() => {
        // Atualiza a lista na tela
        const listaAtualizada = exercicios.map(ex =>
          ex.id === editingId ? { id: editingId, ...dadosAtualizados } : ex
        );
        setExercicios(listaAtualizada);
        setEditingId(null); // Sai do modo de edição
      })
      .catch(error => console.error('Erro ao atualizar exercício:', error));
  };

  // Para o botão de DELETAR (apenas abre o modal)
  const handleDelete = (id) => {
    setItemParaDeletar(id);
  };

  // Para o botão de CONFIRMAR do modal (executa a exclusão)
  const confirmDelete = () => {
    if (itemParaDeletar) {
      fetch(`http://127.0.0.1:5000/api/exercicios/${itemParaDeletar}`, {
        method: 'DELETE',
      })
        .then(() => {
          setExercicios(exercicios.filter(ex => ex.id !== itemParaDeletar));
          setItemParaDeletar(null);
        })
        .catch(error => {
          console.error('Erro ao deletar exercício:', error);
          setItemParaDeletar(null);
        });
    }
  };

  // Para o botão de EDITAR (ativa o modo de edição)
  const handleEdit = (exercicio) => {
    setEditingId(exercicio.id);
    setEditFormData(exercicio);
  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    // <>
    //   <div className="app-container">
    //     {/* Coluna da Esquerda */}
    //     <div className="main-content">
    //       <div className="header">
    //         <h1>Diário de Treino</h1>
    //         <h2>Lista de Exercícios</h2>
    //       </div>
    //       <ul>
    //         {exercicios.map((exercicio) => (
    //           <li className="exercise-card" key={exercicio.id}>
    //             {/* --- Formulário de Edição --- */}
    //             {editingId === exercicio.id ? (
    //               <form onSubmit={handleUpdateSubmit} className='edit-form'>
    //                 <div className="edit-form-inputs">
    //                   <input type="text" name="nome" placeholder='Nome do Exercício'value={editFormData.nome} onChange={handleEditFormChange} required />
    //                   <input type="number" name="series" placeholder='Quantidade de Séries' value={editFormData.series} onChange={handleEditFormChange} required />
    //                   <input type="number" name="repeticoes" placeholder='Quantidade de Repetições' value={editFormData.repeticoes} onChange={handleEditFormChange} required />
    //                   <input type="number" name="peso" step="0.5" placeholder='Peso (kg)' value={editFormData.peso} onChange={handleEditFormChange} required />
    //                 </div>
    //                 <div className="edit-form-actions">
    //                   <button className='btn btn--primary' type="submit">Salvar</button>
    //                   <button className='btn btn--secondary' type="button" onClick={() => setEditingId(null)}>Cancelar</button>
    //                 </div>
    //               </form>
    //             ) : (
    //               <>
    //                 {/* --- Modo de Visualização --- */}
    //                 <div className="exercise-info">
    //                   <strong>{exercicio.nome}</strong><br />
    //                   <small>{exercicio.series} séries de {exercicio.repeticoes} repetições com {exercicio.peso}kg</small>
    //                 </div>
    //                 <div className='card-actions'>
    //                   <button className='btn btn--secondary' onClick={() => handleEdit(exercicio)}>Editar</button>
    //                   <button className='btn btn--danger'onClick={() => handleDelete(exercicio.id)}>Excluir</button>
    //                 </div>
    //               </>
    //             )}
    //           </li>
    //         ))}
    //       </ul>
    //     </div>

    //     {/* Coluna da Direita */}
    //     <div className="sidebar">
    //       <form onSubmit={handleSubmit}>
    //         <div className='form-group'>
    //           <label htmlFor='add-nome'>Nome do Exercício</label>
    //           <input id='add-nome' type='text' name={nome}
    //             onChange={(e) => setNome(e.target.value)} value={nome} placeholder='Ex: Supino Reto'
    //             required
    //           />
    //         </div>

    //         <div className="form-group">
    //           <label htmlFor="add-series">Séries</label>
    //           <input
    //             id="add-series"
    //             type="number"
    //             value={series}
    //             onChange={(e) => setSeries(e.target.value)}
    //             min={0}
    //             required
    //             placeholder='Ex: 4 Séries'
    //           />
    //         </div>

    //         <div className="form-group">
    //           <label htmlFor="add-repeticoes">Repetições</label>
    //           <input
    //             id="add-repeticoes"
    //             type="number"
    //             value={repeticoes}
    //             onChange={(e) => setRepeticoes(e.target.value)}
    //             min={0}
    //             required
    //             placeholder='Ex: 12 Repetições'
    //           />
    //         </div>

    //         <div className="form-group">
    //           <label htmlFor="add-peso">Peso (kg)</label>
    //           <input
    //             id="add-peso"
    //             type="number"
    //             step="0.5"
    //             value={peso}
    //             onChange={(e) => setPeso(e.target.value)}
    //             min={0}
    //             required
    //             placeholder='Ex: 10kg'
    //           />
    //         </div>

    //         <button type='submit' className='btn btn--primary' onClick={handleSubmit}>Adicionar Exercício</button>

    //       </form>
    //     </div>
    //   </div>
      
    //   {/* Modal de Sucesso */}
    //   {showSucessModal && (
    //     <div className='modal-overlay'>
    //       <div className='modal-content'>
    //         <h3>Sucesso!</h3>
    //         <p>Exercício adicionado com sucesso.</p>
    //         <div className='modal-actions'>
    //           <button className='btn btn--primary' onClick={() => setShowSucessModal(false)}>Fechar</button>
    //         </div>
    //       </div>
    //     </div>
    //   )}


    //   {/* Modal de Confirmação de Exclusão */}
    //   {itemParaDeletar !== null && (
    //     <div className='modal-overlay'>
    //       <div className='modal-content'>
    //         <h3>Confirmar Exclusão?</h3>
    //         <p>Você tem certeza que deseja excluir este exercício? Esta ação não pode ser desfeita.</p>
    //         <div className='modal-actions'>
    //           <button className='btn btn--secondary' onClick={() => setItemParaDeletar(null)}>Cancelar</button>
    //           <button className='btn btn--danger' onClick={confirmDelete}>Confirmar</button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
  //   </>

  <ApiExplorer/>
  );
}

export default App;