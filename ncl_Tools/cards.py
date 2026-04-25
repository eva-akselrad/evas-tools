import requests
import time

BASE_URL = "https://003083b9d97e45ae233917d169bd4144-pairs.web.cityinthe.cloud"
PLAYER_NAME = "FlagGetter"

def get_match_key(cid):
    """
    Determines what makes a pair. 
    In this game, it looks like Rank + Color (e.g., '5c' and '5s' are both Black 5s).
    """
    rank = cid[:-1] # Everything except the last character (e.g., '10', 'J', '5')
    suit_char = cid[-1] # The last character (c, s, h, d)
    
    # Group by Color: Clubs/Spades (Black) and Hearts/Diamonds (Red)
    color = "black" if suit_char in ['c', 's'] else "red"
    
    return f"{rank}_{color}"

def solve_pairs():
    session = requests.Session()
    print("[*] Starting new game...")
    
    init_res = session.post(f"{BASE_URL}/api/game/new")
    data = init_res.json()
    game_id = data['id']
    all_cards = data['cards'] 

    # 1. Map cards by Rank and Color
    pair_groups = {}
    for card in all_cards:
        m_key = get_match_key(card['cid'])
        if m_key not in pair_groups:
            pair_groups[m_key] = []
        pair_groups[m_key].append(card['id'])

    # 2. Flip the pairs
    print("[*] Matching by Rank and Color...")
    for m_key, ids in pair_groups.items():
        if len(ids) == 2:
            c1, c2 = ids
            session.post(f"{BASE_URL}/api/game/{game_id}/flip", json={"cardId": c1})
            session.post(f"{BASE_URL}/api/game/{game_id}/flip", json={"cardId": c2})
            print(f"[+] Matched group: {m_key}")
        
        else:
            print(f"[!] Odd group size for {m_key}: {len(ids)}")

    # 3. Finalize
    score_payload = {"name": PLAYER_NAME, "guesses": 26, "gameId": game_id}
    final_res = session.post(f"{BASE_URL}/api/leaderboard", json=score_payload)
    print(f"\nFinal Result: {final_res.json()}")

if __name__ == "__main__":
    solve_pairs()