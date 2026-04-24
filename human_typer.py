import time
import random
import sys
import json
import os
from pynput import keyboard

# --- DEFAULT CONFIGURATION ---
DEFAULT_CONFIG = {
    "input_file": "content_to_type.txt",
    "hotkeys": {
        "start_stop": "f6",
        "exit": "esc"
    },
    "typing_speed": {
        "min_delay": 0.05,
        "max_delay": 0.15,
        "punctuation_delays": {
            ".": 0.8,
            ",": 0.4,
            "!": 0.8,
            "?": 0.8,
            ";": 0.5,
            ":": 0.5,
            "\n": 1.2
        }
    },
    "realism": {
        "error_chance": 0.03,
        "long_pause_chance": 0.01,
        "long_pause_range": [1.5, 4.0],
        "burst_chance": 0.1,
        "burst_len_range": [5, 15],
        "burst_delay_multiplier": 0.6
    },
    "correction": {
        "notice_delay_range": [0.1, 0.4],
        "backspace_delay_range": [0.05, 0.2],
        "correction_pause_range": [0.2, 0.6]
    }
}

CONFIG_FILE = "config.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                user_config = json.load(f)
                # Simple merge: update defaults with user values
                def merge(base, update):
                    for k, v in update.items():
                        if isinstance(v, dict) and k in base:
                            merge(base[k], v)
                        else:
                            base[k] = v
                merge(DEFAULT_CONFIG, user_config)
                print(f"Loaded configuration from {CONFIG_FILE}")
        except Exception as e:
            print(f"Warning: Could not load {CONFIG_FILE} ({e}). Using defaults.")
    else:
        # Create a template config file if it doesn't exist
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(DEFAULT_CONFIG, f, indent=4)
            print(f"Created default configuration template: {CONFIG_FILE}")
        except Exception as e:
            print(f"Warning: Could not create {CONFIG_FILE} ({e})")
    
    return DEFAULT_CONFIG

def get_key(key_name):
    """Helper to convert string key names to pynput Key objects."""
    try:
        if hasattr(keyboard.Key, key_name.lower()):
            return getattr(keyboard.Key, key_name.lower())
        return keyboard.KeyCode.from_char(key_name)
    except:
        return keyboard.Key.f6

class HumanTyper:
    def __init__(self, config):
        self.config = config
        self.file_path = config["input_file"]
        self.running = False
        self.text = ""
        self.controller = keyboard.Controller()
        self.index = 0
        self.burst_remaining = 0

    def load_text(self):
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                self.text = f.read()
            print(f"Loaded {len(self.text)} characters from {self.file_path}")
        except FileNotFoundError:
            print(f"Error: {self.file_path} not found. Please create it.")
            sys.exit(1)

    def toggle(self):
        self.running = not self.running
        if self.running:
            print("\n>>> TYPING STARTED")
            time.sleep(1)
        else:
            print("\n>>> TYPING PAUSED")

    def type_char(self, char):
        realism = self.config["realism"]
        speed = self.config["typing_speed"]
        
        # 1. Random Long Pause (simulating checking something)
        if random.random() < realism["long_pause_chance"]:
            pause_time = random.uniform(*realism["long_pause_range"])
            print(f" (Thinking for {pause_time:.1f}s...) ", end="", flush=True)
            time.sleep(pause_time)

        # 2. Decide if we make a mistake
        if random.random() < realism["error_chance"] and char.isalnum():
            self._simulate_error(char)
        
        # 3. Handle Bursts (typing faster for a few characters)
        if self.burst_remaining <= 0 and random.random() < realism["burst_chance"]:
            self.burst_remaining = random.randint(*realism["burst_len_range"])
        
        # 4. Type the actual character
        self.controller.type(char)
        
        # 5. Calculate Delay
        delay = random.uniform(speed["min_delay"], speed["max_delay"])
        
        # Apply burst multiplier
        if self.burst_remaining > 0:
            delay *= realism["burst_delay_multiplier"]
            self.burst_remaining -= 1
            
        # Punctuation pause
        punc_delays = speed["punctuation_delays"]
        if char in punc_delays:
            delay += random.uniform(0.1, punc_delays[char])
        
        time.sleep(delay)

    def _simulate_error(self, correct_char):
        corr = self.config["correction"]
        
        # Pick a random character (usually a nearby one, but random for simplicity)
        wrong_char = random.choice("abcdefghijklmnopqrstuvwxyz")
        if wrong_char == correct_char:
            wrong_char = "x"
            
        self.controller.type(wrong_char)
        time.sleep(random.uniform(*corr["notice_delay_range"])) # Notice the error
        
        # Backspace to fix
        self.controller.press(keyboard.Key.backspace)
        self.controller.release(keyboard.Key.backspace)
        time.sleep(random.uniform(*corr["backspace_delay_range"])) 
        
        time.sleep(random.uniform(*corr["correction_pause_range"])) # Pause before correcting

    def run(self):
        self.load_text()
        start_key = get_key(self.config["hotkeys"]["start_stop"])
        exit_key = get_key(self.config["hotkeys"]["exit"])
        
        print(f"Hotkeys: {start_key} to Start/Pause, {exit_key} to Exit.")

        def on_press(key):
            if key == start_key:
                self.toggle()
            elif key == exit_key:
                print("Exiting...")
                return False

        with keyboard.Listener(on_press=on_press) as listener:
            while listener.running:
                if self.running and self.index < len(self.text):
                    self.type_char(self.text[self.index])
                    self.index += 1
                    if self.index >= len(self.text):
                        print("\nFinished typing.")
                        self.running = False
                else:
                    time.sleep(0.1)
            listener.join()

if __name__ == "__main__":
    current_config = load_config()
    
    # Create dummy file if it doesn't exist
    if not os.path.exists(current_config["input_file"]):
        with open(current_config["input_file"], "w") as f:
            f.write("This is a demonstration of human-like typing. It now includes bursts, long pauses, and a configuration file!")
        print(f"Created sample file: {current_config['input_file']}")

    typer = HumanTyper(current_config)
    typer.run()
