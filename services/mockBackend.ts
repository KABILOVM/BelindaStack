
import { User, PromoCode, GameResult, PRIZES, THRESHOLDS, PRIZE_DETAILS } from '../types';

const STORAGE_KEYS = {
  USERS: 'belinda_users',
  CODES: 'belinda_codes',
  RESULTS: 'belinda_results',
  CURRENT_USER: 'belinda_current_user_id',
  TRIAL_COUNT: 'lambrotin_trial_count_', 
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackendService {
  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  private saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  private getCodes(): PromoCode[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CODES) || '[]');
  }
  
  private saveCodes(codes: PromoCode[]) {
    localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(codes));
  }

  private getResults(): GameResult[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]');
  }

  async loginUser(phone: string, password?: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    const user = users.find(u => u.phone === phone);

    if (!user) {
      throw new Error("Пользователь с таким номером не найден.");
    }
    
    if (user.name.toLowerCase() === 'admin') return user;

    if (user.password && user.password !== password) {
       throw new Error("Неверный пароль.");
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, user.id);
    return user;
  }

  async registerUser(name: string, city: string, phone: string, password?: string): Promise<User> {
    await delay(500);
    const users = this.getUsers();
    
    if (users.find(u => u.phone === phone)) {
      throw new Error("Этот номер уже зарегистрирован. Пожалуйста, войдите.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      city,
      phone,
      password,
      registeredAt: new Date().toISOString(),
      claimedPrizes: [],
      deliveryRequested: false,
    };

    users.push(newUser);
    this.saveUsers(users);
    
    localStorage.setItem(STORAGE_KEYS.TRIAL_COUNT + newUser.id, '0');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, newUser.id);
    
    return newUser;
  }

  getCurrentUser(): User | null {
    const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) || null;
  }

  async refreshUser(): Promise<User | null> {
    return this.getCurrentUser();
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getTrialCount(userId: string): number {
    return parseInt(localStorage.getItem(STORAGE_KEYS.TRIAL_COUNT + userId) || '0');
  }

  useTrial(userId: string): number {
    const count = this.getTrialCount(userId);
    const newCount = count + 1;
    localStorage.setItem(STORAGE_KEYS.TRIAL_COUNT + userId, newCount.toString());
    return newCount;
  }

  async validateAndUseCode(codeStr: string, userId: string): Promise<boolean> {
    await delay(600);
    const user = this.getUsers().find(u => u.id === userId);
    
    if (user && user.name.toLowerCase() === 'admin') return true;

    const codes = this.getCodes();
    const codeIndex = codes.findIndex(c => c.code === codeStr);

    if (codeIndex === -1) throw new Error('Код не найден');
    if (codes[codeIndex].isUsed) throw new Error('Код уже использован');
    
    codes[codeIndex].isUsed = true;
    codes[codeIndex].assignedTo = userId;
    this.saveCodes(codes);
    return true;
  }

  async generateCodes(quantity: number): Promise<PromoCode[]> {
    const codes = this.getCodes();
    const newCodes: PromoCode[] = [];
    for (let i = 0; i < quantity; i++) {
      const codeStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      newCodes.push({ 
        code: codeStr, 
        isUsed: false, 
        isIssued: false,
        generatedAt: new Date().toISOString() 
      });
    }
    this.saveCodes([...codes, ...newCodes]);
    return newCodes;
  }
  
  async markCodesAsIssued(codeStrings: string[]): Promise<void> {
      const codes = this.getCodes();
      codeStrings.forEach(s => {
          const c = codes.find(x => x.code === s);
          if (c) c.isIssued = true;
      });
      this.saveCodes(codes);
  }

  async saveGameResult(userId: string, score: number, usedCode: string, isTrial: boolean = false): Promise<GameResult> {
    const results = this.getResults();
    
    // Determine potential prize tier reached in this game for history display
    let potentialPrize = null;
    if (!isTrial) {
        if (score >= THRESHOLDS.TIER_5) potentialPrize = PRIZES.TIER_5;
        // Default to Phone/Tablet level 4 is reached (just as a label in history)
        else if (score >= THRESHOLDS.TIER_4_TABLET) potentialPrize = PRIZES.TIER_4_TABLET; // Using Tablet as generic marker for T4
        // Default to TV if level 3 is reached
        else if (score >= THRESHOLDS.TIER_3_TV) potentialPrize = PRIZES.TIER_3_TV;
        else if (score >= THRESHOLDS.TIER_2) potentialPrize = PRIZES.TIER_2;
        else if (score >= THRESHOLDS.TIER_1) potentialPrize = PRIZES.TIER_1;
    }

    const result: GameResult = {
      id: crypto.randomUUID(),
      userId,
      score,
      prize: potentialPrize, 
      playedAt: new Date().toISOString(),
      codeUsed: isTrial ? 'TRIAL' : usedCode,
    };

    results.push(result);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    return result;
  }

  // New Method: Claim a prize
  async claimPrize(userId: string, prizeTitle: string): Promise<User> {
    await delay(300);
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = users[userIndex];
    if (!user.claimedPrizes) user.claimedPrizes = [];

    // Check Rule: Max 2 prizes
    if (user.claimedPrizes.length >= 2) {
      throw new Error("Вы уже выбрали максимальное количество призов (2).");
    }

    // Check Rule: Only 1 Valuable Prize
    const isNewValuable = PRIZE_DETAILS[prizeTitle].isValuable;
    const hasValuable = user.claimedPrizes.some(p => PRIZE_DETAILS[p].isValuable);

    if (isNewValuable && hasValuable) {
      throw new Error("Можно выбрать только один ценный приз.");
    }

    user.claimedPrizes.push(prizeTitle);
    
    // Save updated user
    users[userIndex] = user;
    this.saveUsers(users);
    return user;
  }

  async requestDelivery(userId: string): Promise<User> {
    await delay(300);
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    users[userIndex].deliveryRequested = true;
    this.saveUsers(users);
    return users[userIndex];
  }

  // Helper method to get full history for a specific user
  async getUserResults(userId: string): Promise<GameResult[]> {
    await delay(200);
    const results = this.getResults();
    return results
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }

  async getAdminStats() {
    const users = this.getUsers();
    const codes = this.getCodes();
    const results = this.getResults();
    
    // Count claimed prizes from user profiles
    const claimedCounts = {
      tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0
    };

    users.forEach(u => {
       if (u.claimedPrizes) {
         u.claimedPrizes.forEach(p => {
            if (p === PRIZES.TIER_1) claimedCounts.tier1++;
            else if (p === PRIZES.TIER_2) claimedCounts.tier2++;
            else if (p === PRIZES.TIER_5) claimedCounts.tier5++;
            // Group Tier 3
            else if (
                p === PRIZES.TIER_3_TV || 
                p === PRIZES.TIER_3_WATCH || 
                p === PRIZES.TIER_3_COFFEE || 
                p === PRIZES.TIER_3_SPEAKER ||
                p === PRIZES.TIER_3_HUMIDIFIER
            ) {
                claimedCounts.tier3++;
            }
            // Group Tier 4
            else if (
                p === PRIZES.TIER_4_PHONE ||
                p === PRIZES.TIER_4_TABLET ||
                p === PRIZES.TIER_4_BIKE ||
                p === PRIZES.TIER_4_AC ||
                p === PRIZES.TIER_4_VACUUM ||
                p === PRIZES.TIER_4_OVEN
            ) {
                claimedCounts.tier4++;
            }
         });
       }
    });

    return {
      totalUsers: users.length,
      totalCodes: codes.length,
      usedCodes: codes.filter(c => c.isUsed).length,
      deliveryRequests: users.filter(u => u.deliveryRequested).length,
      totalGames: results.length,
      prizesAwarded: claimedCounts,
      recentResults: results.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()).slice(0, 50),
      allCodes: codes,
      users: users,
    };
  }
}

export const backend = new MockBackendService();
