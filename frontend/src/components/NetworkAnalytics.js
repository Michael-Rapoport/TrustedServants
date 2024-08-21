 import React from 'react';

const NetworkAnalytics = ({ data }) => {
  return (
    <div>
      <h3>Network Analytics</h3>
      <p>Average Clustering: {data.average_clustering.toFixed(3)}</p>
      <p>Network Density: {data.network_density.toFixed(3)}</p>
      <h4>Top 5 Entities by Centrality Measures:</h4>
      {Object.entries(data.centrality).map(([measure, scores]) => (
        <div key={measure}>
          <h5>{measure} Centrality:</h5>
          <ul>
            {Object.entries(scores)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([entity, score]) => (
                <li key={entity}>{entity}: {score.toFixed(3)}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default NetworkAnalytics;
