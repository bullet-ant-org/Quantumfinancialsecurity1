import React, { useState, useEffect, useRef, useCallback } from "react";
import { PolarArea, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import './Portfolio.css';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const AnimatedNumber = ({ value }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const end = value;
          if (start === end) return;

          let startTime = null;
          const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCurrentValue(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{currentValue.toLocaleString()}</span>;
};

const Portfolio = () => {
  const [doughnutData, setDoughnutData] = useState(null);
  const [stats, setStats] = useState(null);
  const doughnutRef = useRef(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/stats/platform`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const fetchedStats = await res.json();
      setStats(fetchedStats);

      setDoughnutData({
        labels: ['Users Enrolled', 'Total Asset Cap (Last Year)', 'Humanitarian Projects'],
        datasets: [
          {
            label: 'QFS Stats',
            data: [fetchedStats.usersEnrolled, fetchedStats.totalAssetCap, fetchedStats.humanitarianProjects],
            backgroundColor: [
              'rgba(0, 153, 255, 1)',
              'rgba(0, 255, 255, 1)',
              'rgba(255, 183, 0, 1)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Could not load platform stats:", error);
      // Fallback to static data on error
      setDoughnutData({
        labels: ['Users Enrolled', 'Total Asset Cap (Last Year)', 'Humanitarian Projects'],
        datasets: [{ data: [170000, 76000000, 2000] }]
      });
    }
  }, [apiUrl]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          fetchStats();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (doughnutRef.current) {
      observer.observe(doughnutRef.current);
    }

    return () => observer.disconnect();
  }, [fetchStats]);

  const polarData = {
    labels: ['Bitcoin', 'Ethereum', 'Solana', 'Ripple', 'Cardano'],
    datasets: [
      {
        label: 'Asset Distribution',
        data: [11, 16, 7, 3, 14],
        backgroundColor: [
          'rgba(255, 0, 55, 0.5)',
          'rgba(0, 153, 255, 0.5)',
          'rgba(255, 183, 0, 0.5)',
          'rgba(0, 255, 255, 0.5)',
          'rgba(85, 0, 255, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      r: {
        ticks: {
          color: 'white',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      }
    }
  };

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="container text-white">
        <h2 className="text-center mb-5">Our Portfolio & Reach</h2>
        {stats && (
          <div className="row text-center mb-5 stat-counters">
            <div className="col-md-4">
              <div className="stat-item">
                <h3 className="stat-value"><AnimatedNumber value={stats.usersEnrolled} /></h3>
                <p className="stat-label">Users Enrolled</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <h3 className="stat-value">$<AnimatedNumber value={stats.totalAssetCap} /></h3>
                <p className="stat-label">Total Asset Cap</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-item">
                <h3 className="stat-value"><AnimatedNumber value={stats.humanitarianProjects} /></h3>
                <p className="stat-label">Humanitarian Projects</p>
              </div>
            </div>
          </div>
        )}
        <div className="row g-5 align-items-center">
          <div className="col-lg-6"><div className="chart-container"><h3 className="text-center mb-3">Asset Distribution</h3><PolarArea data={polarData} options={chartOptions} /></div></div>
          <div className="col-lg-6" ref={doughnutRef}>
            <div className="chart-container">
              <h3 className="text-center mb-3">Platform Statistics</h3>
              {doughnutData && 
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: 'white' } } } }} />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
