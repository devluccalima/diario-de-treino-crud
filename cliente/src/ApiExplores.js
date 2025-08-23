import { useState, useEffect } from 'react';

function ApiExplorer() {
  const [wgerExercises, setWgerExercises] = useState([]);
  const [loading, setLoading] = useState(true); // Um estado para sabermos se está a carregar

  


  useEffect(() => {
    const apiUrl = 'https://wger.de/api/v2/exerciseinfo/?language=pt';

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log("Dados da API WGER:", data);
        setWgerExercises(data.results); // Lembre-se que os exercícios estão dentro de 'results'
        setLoading(false); // Paramos de carregar
      })
      .catch(error => {
        console.error("Erro ao buscar da API WGER:", error);
        setLoading(false); // Paramos de carregar mesmo se der erro
      });
  }, []); // O array vazio garante que isto só roda uma vez

  if (loading) {
    return <div>A carregar exercícios da biblioteca...</div>;
  }
  const getExerciseName = (translations) => {
  const ptTranslation = translations.find(t => t.language === 7);
  if (ptTranslation && ptTranslation.name) {
    return ptTranslation.name;
  }
  const enTranslation = translations.find(t => t.language === 2);
  if (enTranslation && enTranslation.name) {
    return enTranslation.name;
  }
  return "Nome não encontrado";
};

  return (
    <div>
      <h1>Explorador da API WGER</h1>
      <ul>
        {wgerExercises.map(exercise => (
          <li key={exercise.uuid}>
            {getExerciseName(exercise.translations)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ApiExplorer;