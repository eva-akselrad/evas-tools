import argparse
import sys

try:
    import qrcode
except ImportError:
    print("The 'qrcode' library is required. Install it using:")
    print("pip install qrcode[pil]")
    sys.exit(1)

def generate_qr(link, output_file):
    """Generates a QR code for the given link and saves it to output_file."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(link)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_file)
    print(f"QR code for '{link}' saved to {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Generate a QR code for a link.")
    parser.add_argument("link", help="The URL or text to encode in the QR code")
    parser.add_argument("-o", "--output", default="qrcode.png", help="The output filename (default: qrcode.png)")

    args = parser.parse_args()
    
    generate_qr(args.link, args.output)

if __name__ == "__main__":
    main()
