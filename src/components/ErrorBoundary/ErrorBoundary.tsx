// ============================================================
// BIDIWS — ErrorBoundary
// Fichier : src/components/ErrorBoundary/ErrorBoundary.tsx
// Filet de sécurité global : une erreur JS non attrapée sur n'importe
// quelle page ne doit plus faire planter tout l'arbre React (écran
// blanc jusqu'au rechargement complet). Doit être une class component
// — pas d'équivalent hooks pour getDerivedStateFromError/
// componentDidCatch en React 19.
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from "react";
import "./ErrorBoundary.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("BIDIWS — Erreur non attrapée par un composant", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h1 className="error-boundary__title">Une erreur est survenue</h1>
            <p className="error-boundary__text">
              Quelque chose s'est mal passé pendant l'affichage de cette page.
            </p>
            <button className="error-boundary__button" onClick={this.handleReload}>
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
