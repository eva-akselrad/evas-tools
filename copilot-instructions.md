# Copilot Instructions for evas-tools

## Project Overview

**evas-tools** is a collection of utility scripts for photography workflows. Currently contains tools for batch processing Canon raw image files (CR2 format) to JPEG.

## Project Structure

- **convert_cr2_to_jpg.py** - CLI tool for batch converting Canon CR2 raw files to JPEG format
  - Main dependencies: `rawpy`, `Pillow`, `rich`
  - Features parallel processing, configurable quality, and progress UI

## Dependencies & Setup

### Required Packages

```bash
pip install rawpy Pillow rich
```

The script includes built-in dependency checking and will print installation instructions if packages are missing.

### Python Version

Python 3.6+ (uses `pathlib.Path`, f-strings, and concurrent.futures)

## Running Scripts

### CR2 to JPEG Conversion

```bash
python convert_cr2_to_jpg.py [input_folder] [options]
```

**Arguments:**
- `input_folder` - Folder containing CR2 files (default: `CR2`)
- `-o, --output_folder` - Output folder for JPEG files (default: `JPEG`)
- `-q, --quality` - JPEG quality 1-100 (default: `100`)
- `-w, --workers` - Number of parallel workers (default: CPU count)

**Examples:**
```bash
# Convert CR2s from default folder (CR2) to default output (JPEG)
python convert_cr2_to_jpg.py

# Convert from custom input folder with custom output
python convert_cr2_to_jpg.py /path/to/raw_files -o /path/to/output

# Use quality 85 and 4 workers
python convert_cr2_to_jpg.py CR2 -q 85 -w 4
```

## Key Implementation Details

### Parallel Processing

The script uses `ProcessPoolExecutor` to parallelize RAW decoding and conversion, which is CPU-intensive. Default worker count is the system's CPU count—adjust with `-w` flag if needed.

### Progress UI

Uses the `rich` library for visual feedback:
- Animated progress bar with spinner
- Real-time conversion messages
- ASCII banner on startup
- Summary statistics at completion

### Existing File Handling

The script skips files that already exist in the output folder, allowing safe re-runs without duplication.

### RAW Processing

Uses `rawpy` to decode CR2 files with camera white balance by default. Converts the postprocessed pixel array to PIL Image and saves as JPEG.

## Coding Conventions

- **CLI argument handling**: Uses `argparse` with sensible defaults
- **Path handling**: Uses `pathlib.Path` for cross-platform compatibility
- **Error handling**: Try-except blocks with informative error messages
- **Rich output**: Uses styled console output for user-facing messages (panels, colors, emojis)
- **Function docstrings**: Brief one-line docstrings for utility functions

## Testing

No automated test suite currently exists. Manual testing should verify:
- Successful conversion of CR2 files
- Quality parameter affects output file size
- Parallel processing completes without corrupting output
- Existing file skipping works correctly
- Dependency check and error messages display properly
