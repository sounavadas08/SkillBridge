import os
from PIL import Image

os.makedirs('public', exist_ok=True)

dark_path = 'assets/Gemini_Generated_Image_fds8c7fds8c7fds8.png'
light_path = 'assets/Gemini_Generated_Image_fixir0fixir0fixi.png'

img_dark = Image.open(dark_path).convert('RGBA')
img_light = Image.open(light_path).convert('RGBA')

# 1. Save full logos optimized
img_dark.resize((1024, 1024), Image.Resampling.LANCZOS).save('public/logo-dark.png', 'PNG', optimize=True)
img_light.resize((1024, 1024), Image.Resampling.LANCZOS).save('public/logo-light.png', 'PNG', optimize=True)

# 2. Extract emblem icon (crop centered on X=1022, Y=863 with square box of size 850x850)
cx, cy = 1022, 863
box_size = 850
left = max(0, cx - box_size // 2)
top = max(0, cy - box_size // 2)
right = min(2048, left + box_size)
bottom = min(2048, top + box_size)

emblem_dark = img_dark.crop((left, top, right, bottom))
emblem_light = img_light.crop((left, top, right, bottom))

emblem_dark.resize((512, 512), Image.Resampling.LANCZOS).save('public/logo-icon-dark.png', 'PNG', optimize=True)
emblem_light.resize((512, 512), Image.Resampling.LANCZOS).save('public/logo-icon-light.png', 'PNG', optimize=True)
emblem_dark.resize((128, 128), Image.Resampling.LANCZOS).save('public/favicon.png', 'PNG', optimize=True)
emblem_dark.resize((64, 64), Image.Resampling.LANCZOS).save('public/favicon-32.png', 'PNG', optimize=True)

# Default logo
emblem_dark.resize((256, 256), Image.Resampling.LANCZOS).save('public/logo-icon.png', 'PNG', optimize=True)

# Transparent emblem for light:
# In light image, background is white (255, 255, 255). We can make pure white background transparent:
light_emblem_rgba = emblem_light.convert('RGBA')
datas = light_emblem_rgba.getdata()
newData = []
for item in datas:
    # If pixel is very close to white, make transparent with soft edge
    brightness = (item[0] + item[1] + item[2]) / 3
    if brightness > 250:
        newData.append((item[0], item[1], item[2], 0))
    elif brightness > 240:
        alpha = int((250 - brightness) / 10 * 255)
        newData.append((item[0], item[1], item[2], alpha))
    else:
        newData.append(item)
light_emblem_rgba.putdata(newData)
light_emblem_rgba.resize((512, 512), Image.Resampling.LANCZOS).save('public/logo-icon-transparent.png', 'PNG', optimize=True)

print("Generated logos in public/ successfully!")
