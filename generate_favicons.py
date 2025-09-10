#!/usr/bin/env python3
"""
Favicon Generator for Fly2Any
Creates a complete set of favicon files based on brand colors
Colors: Orange (#FF6B35), Blue (#1E40AF), White (#FFFFFF)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Brand colors
ORANGE = (255, 107, 53)  # #FF6B35
BLUE = (30, 64, 175)     # #1E40AF
WHITE = (255, 255, 255)  # #FFFFFF
YELLOW = (255, 215, 0)   # Gold for "Any" text
RED_ORANGE = (255, 69, 0) # For "2" element

def create_airplane_icon(size, bg_color=None):
    """Create a simple airplane icon with Fly2Any branding"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle if needed
    if bg_color:
        draw.ellipse([0, 0, size-1, size-1], fill=bg_color)
    
    # Scale factors for different sizes
    scale = size / 48.0
    
    # Simple airplane silhouette (centered)
    center_x, center_y = size // 2, size // 2
    
    # Airplane body (elongated ellipse)
    body_width = int(6 * scale)
    body_height = int(20 * scale)
    body_x1 = center_x - body_width // 2
    body_y1 = center_y - body_height // 2
    body_x2 = center_x + body_width // 2
    body_y2 = center_y + body_height // 2
    
    draw.ellipse([body_x1, body_y1, body_x2, body_y2], fill=BLUE)
    
    # Wings (horizontal ellipse)
    wing_width = int(18 * scale)
    wing_height = int(4 * scale)
    wing_x1 = center_x - wing_width // 2
    wing_y1 = center_y - wing_height // 2
    wing_x2 = center_x + wing_width // 2
    wing_y2 = center_y + wing_height // 2
    
    draw.ellipse([wing_x1, wing_y1, wing_x2, wing_y2], fill=ORANGE)
    
    # Tail (small triangle)
    tail_size = int(4 * scale)
    tail_points = [
        (center_x, center_y + body_height // 2),
        (center_x - tail_size, center_y + body_height // 2 + tail_size),
        (center_x + tail_size, center_y + body_height // 2 + tail_size)
    ]
    draw.polygon(tail_points, fill=ORANGE)
    
    # Add a small "2" in the center for brand recognition (for larger sizes)
    if size >= 32:
        try:
            # Try to use a font, fallback to default if not available
            font_size = max(8, int(12 * scale))
            font = ImageFont.load_default()
            
            # Draw "2" in red-orange
            text = "2"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            text_x = center_x - text_width // 2
            text_y = center_y - text_height // 2
            
            draw.text((text_x, text_y), text, fill=WHITE, font=font)
        except:
            # Fallback: draw a simple "2" shape
            draw.rectangle([center_x-2, center_y-3, center_x+2, center_y+3], fill=WHITE)
    
    return img

def create_f2a_monogram(size, bg_color=WHITE):
    """Create F2A monogram favicon"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background
    if bg_color:
        draw.rectangle([0, 0, size-1, size-1], fill=bg_color)
    
    # Scale factor
    scale = size / 48.0
    font_size = max(8, int(16 * scale))
    
    try:
        font = ImageFont.load_default()
        
        # Draw F2A text
        text = "F2A"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = (size - text_width) // 2
        text_y = (size - text_height) // 2
        
        # Draw text with brand colors
        draw.text((text_x, text_y), "F", fill=BLUE, font=font)
        draw.text((text_x + text_width//3, text_y), "2", fill=ORANGE, font=font)
        draw.text((text_x + 2*text_width//3, text_y), "A", fill=BLUE, font=font)
        
    except:
        # Fallback: simple colored rectangles
        third = size // 3
        draw.rectangle([0, 0, third-1, size-1], fill=BLUE)
        draw.rectangle([third, 0, 2*third-1, size-1], fill=ORANGE)
        draw.rectangle([2*third, 0, size-1, size-1], fill=BLUE)
    
    return img

def save_favicon_files():
    """Generate and save all required favicon files"""
    output_dir = r"C:\Users\Power\fly2any\public"
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate different sizes
    sizes_airplane = [16, 32, 48, 180, 192, 512]
    
    print("Generating favicon files...")
    
    # Create airplane-based favicons
    for size in sizes_airplane:
        if size <= 32:
            # For small sizes, use simpler design with white background
            img = create_airplane_icon(size, bg_color=WHITE)
        else:
            # For larger sizes, use transparent background
            img = create_airplane_icon(size)
        
        # Save specific files
        if size == 16:
            img.save(os.path.join(output_dir, "favicon-16x16.png"))
            print("Created favicon-16x16.png")
        elif size == 32:
            img.save(os.path.join(output_dir, "favicon-32x32.png"))
            print("Created favicon-32x32.png")
        elif size == 180:
            img.save(os.path.join(output_dir, "apple-touch-icon.png"))
            print("Created apple-touch-icon.png")
        elif size == 192:
            img.save(os.path.join(output_dir, "android-chrome-192x192.png"))
            print("Created android-chrome-192x192.png")
        elif size == 512:
            img.save(os.path.join(output_dir, "android-chrome-512x512.png"))
            print("Created android-chrome-512x512.png")
    
    # Create ICO file (multi-resolution)
    ico_sizes = [16, 32, 48]
    ico_images = []
    
    for size in ico_sizes:
        img = create_airplane_icon(size, bg_color=WHITE)
        ico_images.append(img)
    
    # Save ICO file
    ico_path = os.path.join(output_dir, "favicon.ico")
    ico_images[0].save(ico_path, format='ICO', sizes=[(16,16), (32,32), (48,48)])
    print("Created favicon.ico (multi-resolution: 16x16, 32x32, 48x48)")
    
    print("\nAll favicon files created successfully!")
    print("Files saved to: " + output_dir)
    
    # Generate base64 encoded favicon for immediate use
    import base64
    with open(ico_path, 'rb') as f:
        ico_data = f.read()
        ico_base64 = base64.b64encode(ico_data).decode('utf-8')
        print("\nBase64 encoded favicon.ico for immediate use:")
        print("data:image/x-icon;base64," + ico_base64[:100] + "...") # Show first 100 chars
    
    return ico_base64

if __name__ == "__main__":
    # Check if PIL is available
    try:
        favicon_base64 = save_favicon_files()
        print("\nFavicon generation completed successfully!")
    except ImportError:
        print("Error: PIL (Pillow) is required. Please install it with: pip install Pillow")
    except Exception as e:
        print(f"Error generating favicons: {e}")