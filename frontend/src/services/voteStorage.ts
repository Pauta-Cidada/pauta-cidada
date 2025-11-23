// Serviço para gerenciar votos no localStorage

export type VoteType = 'upvote' | 'downvote';

interface VoteRecord {
  newsId: string;
  voteType: VoteType;
  timestamp: number;
}

const STORAGE_KEY = 'pauta_cidada_votes';

class VoteStorageService {
  private getVotes(): Map<string, VoteRecord> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return new Map();

      const votesArray: VoteRecord[] = JSON.parse(stored);

      return new Map(votesArray.map((vote) => [vote.newsId, vote]));
    } catch (error) {
      console.error('Error reading votes from localStorage:', error);
      return new Map();
    }
  }

  private saveVotes(votes: Map<string, VoteRecord>): void {
    try {
      const votesArray = Array.from(votes.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votesArray));
    } catch (error) {
      console.error('Error saving votes to localStorage:', error);
    }
  }

  /**
   * Registra um voto para uma notícia
   */
  setVote(newsId: string, voteType: VoteType): void {
    const votes = this.getVotes();
    votes.set(newsId, {
      newsId,
      voteType,
      timestamp: Date.now(),
    });
    this.saveVotes(votes);
  }

  /**
   * Obtém o voto do usuário para uma notícia específica
   */
  getVote(newsId: string): VoteType | null {
    const votes = this.getVotes();
    const vote = votes.get(newsId);
    return vote ? vote.voteType : null;
  }

  /**
   * Verifica se o usuário já votou em uma notícia
   */
  hasVoted(newsId: string): boolean {
    return this.getVotes().has(newsId);
  }

  /**
   * Remove o voto de uma notícia (caso necessário no futuro)
   */
  removeVote(newsId: string): void {
    const votes = this.getVotes();
    votes.delete(newsId);
    this.saveVotes(votes);
  }

  /**
   * Limpa todos os votos (útil para testes)
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const voteStorage = new VoteStorageService();
