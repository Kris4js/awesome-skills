import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BeaconWorkbench } from '../templates/BeaconWorkbench';
import '../templates/beacon.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><BeaconWorkbench initialView={new URLSearchParams(window.location.search).get('view') === 'mysql' ? 'mysql-connection' : 'datasets'} /></StrictMode>,
);
