import { useState, useEffect } from 'react';
import './App.css'
import Rotinas from './Rotinas';

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
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);

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
      fetch(`http://localhost:5000/api/exercicios/${itemParaDeletar}`, {
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
    <div className="app-container">
      <div className="main-content">
        <Rotinas />
      </div>
      {/* A nossa sidebar pode ficar aqui por enquanto, ou podemos removê-la */}
    </div>
  );
}

export default App;