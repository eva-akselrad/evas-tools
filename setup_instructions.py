import os
import shutil

# Create .github directory if it doesn't exist
os.makedirs(r'C:\Users\scien\OneDrive\Documents\GitHub\evas tools\.github', exist_ok=True)

# Move the file
src = r'C:\Users\scien\OneDrive\Documents\GitHub\evas tools\copilot-instructions.md'
dst = r'C:\Users\scien\OneDrive\Documents\GitHub\evas tools\.github\copilot-instructions.md'

if os.path.exists(src):
    shutil.move(src, dst)
    print(f"✓ Moved copilot-instructions.md to .github/")
else:
    print("Source file not found")
