import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RRSPOptimizerChart = ({ language, income, contribution }) => {
  const chartRef = useRef(null);

  const translations = {
    en: {
      title: "RRSP Optimization Chart",
      xAxis: "RRSP Contribution ($)",
      yAxis: "Tax Savings ($)",
      currentContribution: "Current Contribution",
      maxPotentialSavings: "Max Potential Savings",
      lineLabel: "Tax Savings vs Contribution",
      tooltipContribution: "Contribution: $",
      tooltipSavings: "Savings: $"
    },
    fr: {
      title: "Graphique d'Optimisation du REER",
      xAxis: "Versement au REER ($)",
      yAxis: "Économies d'impôt ($)",
      currentContribution: "Versement Actuel",
      maxPotentialSavings: "Économies Potentielles Maximales",
      lineLabel: "Économies d'impôt vs Versement",
      tooltipContribution: "Versement: $",
      tooltipSavings: "Économies: $"
    }
  };

  const t = translations[language];

  // Calculate tax savings for different contribution levels
  const calculateTaxSavings = (income, contribution) => {
    // This would typically call your actual calculation function
    // For now, using a simplified version based on the existing calculator
    const maxContribution = Math.min(income, 31560); // 2025 RRSP limit
    const effectiveContribution = Math.min(contribution, maxContribution);
    
    // Simplified tax calculation based on income brackets
    let marginalRate = 0.2885; // Default lowest rate
    
    if (income > 235430) marginalRate = 0.5335;
    else if (income > 165430) marginalRate = 0.4835;
    else if (income > 110972) marginalRate = 0.4385;
    else if (income > 57965) marginalRate = 0.3885;
    else if (income > 51268) marginalRate = 0.3325;
    
    return effectiveContribution * marginalRate;
  };

  // Generate data for the chart
  const generateChartData = () => {
    const data = [];
    const maxContribution = Math.min(income, 31560);
    const step = maxContribution / 20; // 20 points for the chart
    
    for (let i = 0; i <= 20; i++) {
      const contrib = i * step;
      const savings = calculateTaxSavings(income, contrib);
      data.push({
        contribution: contrib,
        savings: savings
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  const data = {
    labels: chartData.map((item, index) => index % 4 === 0 ? `$${Math.round(item.contribution).toLocaleString()}` : ''), // Show label every 4th point
    datasets: [
      {
        label: t.lineLabel,
        data: chartData.map(item => item.savings),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t.title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const contribution = chartData[dataIndex].contribution;
            return [
              `${t.tooltipContribution}${Math.round(contribution).toLocaleString()}`,
              `${t.tooltipSavings}${Math.round(context.parsed.y).toLocaleString()}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t.yAxis
        }
      },
      x: {
        title: {
          display: true,
          text: t.xAxis
        }
      }
    },
  };

  return (
    <div className="rrsp-optimizer-chart">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default RRSPOptimizerChart;