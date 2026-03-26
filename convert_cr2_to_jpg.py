import os
import argparse
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

try:
    import rawpy
    from PIL import Image
    from rich.console import Console
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeRemainingColumn, TaskProgressColumn
    from rich.text import Text
except ImportError:
    print("Required packages are missing. Please install them by running:")
    print("pip install rawpy Pillow rich")
    exit(1)

console = Console()

def convert_image(cr2_path, jpg_path, quality=100):
    """
    Converts a single CR2 file to JPEG.
    """
    try:
        # Open the raw image
        with rawpy.imread(str(cr2_path)) as raw:
            # Postprocess the raw image (uses camera white balance by default)
            rgb = raw.postprocess(use_camera_wb=True)
        
        # Convert the pixel array to a PIL Image and save as JPEG
        img = Image.fromarray(rgb)
        img.save(str(jpg_path), "JPEG", quality=quality)
        
        return True, str(cr2_path)
    except Exception as e:
        return False, f"Failed to convert {cr2_path.name}: {e}"


def main():
    parser = argparse.ArgumentParser(description="Convert a folder of CR2 files to JPEG format.")
    parser.add_argument("input_folder", nargs="?", default="CR2", help="Path to the folder containing CR2 files (default: CR2)")
    parser.add_argument("-o", "--output_folder", help="Path to save JPEG files (default: JPEG)", default="JPEG")
    parser.add_argument("-q", "--quality", type=int, default=100, help="JPEG export quality (1-100), default: 100")
    parser.add_argument("-w", "--workers", type=int, default=os.cpu_count(), help="Number of parallel workers for conversion")
    
    args = parser.parse_args()
    
    input_folder = Path(args.input_folder)
    output_folder = Path(args.output_folder)
    
    # Beautiful Banner Logo
    banner_text = """    ____ ____ ___        _               _ ____   ____ 
   / ___|  _ \__ \      | |_ ___        | |  _ \ / ___|
  | |   | |_) |/ /   _  | __/ _ \    _  | | |_) | |  _ 
  | |___|  _ <|_|   | |_| || (_) |  | |_| |  __/| |_| |
   \____|_| \_\(_)   \___\__\___/    \___/|_|    \____|"""
    banner = Text(banner_text, justify="center", style="bold cyan")
    subtitle = Text("High Quality RAW Processing", justify="center", style="italic white")
    banner.append("\n\n")
    banner.append(subtitle)
    console.print(Panel(banner, border_style="bright_blue", padding=(1, 2), title="📸", title_align="center"))
    
    if not input_folder.is_dir():
        console.print(f"[bold red]❌ Error:[/bold red] Input folder [cyan]'{input_folder}'[/cyan] does not exist.\n")
        return
        
    # Create output folder if it doesn't exist
    output_folder.mkdir(parents=True, exist_ok=True)
    
    # Find all CR2 files (case-insensitive)
    cr2_files = list(input_folder.glob("*.CR2")) + list(input_folder.glob("*.cr2"))
    
    if not cr2_files:
        console.print(f"[bold yellow]⚠️  No CR2 files found in [cyan]'{input_folder}'[/cyan].[/bold yellow]\n")
        return
        
    console.print(f"[bold green]✨ Found {len(cr2_files)} CR2 files.[/bold green] Converting to JPEG with quality {args.quality}...\n")
    
    success_count = 0
    errors = []

    # Setup the rich progress bar
    with Progress(
        SpinnerColumn(style="bold magenta"),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=40, complete_style="green", finished_style="bold green"),
        TaskProgressColumn(),
        TimeRemainingColumn(),
        console=console,
        transient=False
    ) as progress:
        
        task = progress.add_task("[cyan]Processing images...", total=len(cr2_files))
        
        # Use multiple processes to speed up RAW decoding and conversion
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = {}
            for cr2_path in cr2_files:
                jpg_path = output_folder / (cr2_path.stem + ".jpg")
                
                # Skip if the file already exists
                if jpg_path.exists():
                    progress.console.print(f"[yellow]⏭️  Skipping:[/yellow] {jpg_path.name} (Already exists)")
                    success_count += 1
                    progress.advance(task)
                    continue
                    
                futures[executor.submit(convert_image, cr2_path, jpg_path, args.quality)] = cr2_path
                
            # Process results as they complete
            for future in as_completed(futures):
                success, message = future.result()
                if success:
                    progress.console.print(f"[green]✔️  Converted:[/green] {Path(message).name}")
                    success_count += 1
                else:
                    errors.append(message)
                    progress.console.print(f"[red]❌ Error:[/red] {message}")
                
                # Update progress bar
                progress.advance(task)
                
    console.print("\n[bold cyan]🎉 Conversion Complete! 🎉[/bold cyan]")
    console.print(f"✅ Successfully converted [bold green]{success_count} out of {len(cr2_files)}[/bold green] files.")
    
    if errors:
        console.print(f"[bold red]⚠️  Encountered {len(errors)} errors during conversion.[/bold red]")

if __name__ == "__main__":
    main()
