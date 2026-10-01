import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw

# 1. Load Image 3 (User's uploaded Burp Suite logo)
src_logo = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/.user_uploaded/media_1790266211322.jpg').convert('RGB')
w, h = src_logo.size

# Upscale 4x for extreme sub-pixel smooth bevels and rendering
scale = 4
logo_large = src_logo.resize((w * scale, h * scale), Image.LANCZOS)
W, H = logo_large.size
arr = np.array(logo_large, dtype=np.float32)

# Create a clean solid rounded rectangle mask for the squircle:
# In Image 3:
# Bounding box of orange logo: x in [6, 302], y in [18, 306]
# Corner radius is ~ 55px (scaled * 4 = 220px)
mask_img = Image.new('L', (W, H), 0)
draw = ImageDraw.Draw(mask_img)

bx0 = 6 * scale
by0 = 18 * scale
bx1 = 302 * scale
by1 = 306 * scale
radius = 54 * scale

draw.rounded_rectangle([bx0, by0, bx1, by1], radius=radius, fill=255)
in_squircle = np.array(mask_img) > 128

# Identify white crack vs orange body inside the squircle
# Any pixel inside squircle with high RGB is the white crack
is_white_raw = (arr[:, :, 0] > 220) & (arr[:, :, 1] > 220) & (arr[:, :, 2] > 220)
in_crack = is_white_raw & in_squircle
in_orange = in_squircle & ~in_crack

# 2. Build 3D Heightmap Z(x, y)
dist_outer = ndimage.distance_transform_edt(in_squircle)
bevel_radius = 45.0
z_outer = np.clip(dist_outer / bevel_radius, 0.0, 1.0)
z_outer = 0.5 * (1.0 - np.cos(np.pi * z_outer))

center_x, center_y = W / 2.0, H / 2.0
dist_center = np.sqrt((np.arange(W)[None, :] - center_x)**2 + (np.arange(H)[:, None] - center_y)**2)
max_r = np.sqrt(center_x**2 + center_y**2)
dome = np.clip(1.0 - (dist_center / max_r)**2, 0.0, 1.0) * 0.15

z_base = (z_outer * 0.85 + dome) * in_squircle

# 3D Embossing for the White Lightning Ribbon
dist_crack_in = ndimage.distance_transform_edt(in_crack)
crack_bevel_r = 14.0
crack_bevel = np.clip(dist_crack_in / crack_bevel_r, 0.0, 1.0)
crack_bevel = 0.5 * (1.0 - np.cos(np.pi * crack_bevel))

# Heightfield Z
Z = z_base * 35.0
Z[in_crack] += crack_bevel[in_crack] * 8.0

Z_smooth = ndimage.gaussian_filter(Z, sigma=1.5)

# 3. Compute 3D Surface Normals
sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32) / 8.0
sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32) / 8.0

dzdx = ndimage.convolve(Z_smooth, sobel_x)
dzdy = ndimage.convolve(Z_smooth, sobel_y)

norm_len = np.sqrt(dzdx**2 + dzdy**2 + 1.0)
Nx = -dzdx / norm_len
Ny = -dzdy / norm_len
Nz = 1.0 / norm_len

# 4. Physically Based 3D Lighting
L_key = np.array([-0.55, -0.65, 0.65], dtype=np.float32)
L_key /= np.linalg.norm(L_key)

V = np.array([0.0, 0.0, 1.0], dtype=np.float32)
H_key = L_key + V
H_key /= np.linalg.norm(H_key)

L_rim = np.array([-0.85, -0.25, 0.45], dtype=np.float32)
L_rim /= np.linalg.norm(L_rim)
H_rim = L_rim + V
H_rim /= np.linalg.norm(H_rim)

L_bounce = np.array([0.65, 0.65, 0.4], dtype=np.float32)
L_bounce /= np.linalg.norm(L_bounce)

NdotL_key = np.clip(Nx * L_key[0] + Ny * L_key[1] + Nz * L_key[2], 0.0, 1.0)
NdotL_rim = np.clip(Nx * L_rim[0] + Ny * L_rim[1] + Nz * L_rim[2], 0.0, 1.0)
NdotL_bounce = np.clip(Nx * L_bounce[0] + Ny * L_bounce[1] + Nz * L_bounce[2], 0.0, 1.0)

NdotH_key = np.clip(Nx * H_key[0] + Ny * H_key[1] + Nz * H_key[2], 0.0, 1.0)
NdotH_rim = np.clip(Nx * H_rim[0] + Ny * H_rim[1] + Nz * H_rim[2], 0.0, 1.0)

NdotV = np.clip(Nz, 0.0, 1.0)
fresnel = (1.0 - NdotV) ** 4.0

# Base Material Colors
color_orange = np.array([253.0, 125.0, 0.0], dtype=np.float32) / 255.0
color_white = np.array([255.0, 255.0, 255.0], dtype=np.float32) / 255.0

base_color = np.zeros((H, W, 3), dtype=np.float32)
base_color[in_orange] = color_orange
base_color[in_crack] = color_white

# Shading for Orange Surface
ambient_orange = 0.35
diffuse_orange = NdotL_key[:, :, None] * 0.75
bounce_orange = NdotL_bounce[:, :, None] * np.array([0.45, 0.25, 0.05], dtype=np.float32)
spec_orange = (NdotH_key ** 24.0)[:, :, None] * 0.75 + (NdotH_key ** 80.0)[:, :, None] * 0.65
rim_orange = (NdotH_rim ** 32.0)[:, :, None] * np.array([0.4, 0.7, 1.0], dtype=np.float32) * 0.65
fresnel_orange = fresnel[:, :, None] * np.array([0.8, 0.9, 1.0], dtype=np.float32) * 0.50

shaded_orange = base_color * (ambient_orange + diffuse_orange + bounce_orange) + spec_orange + rim_orange + fresnel_orange

# Shading for White Lightning Ribbon (Pure luminous crisp white with specular shine)
ambient_white = 0.85
diffuse_white = NdotL_key[:, :, None] * 0.25
spec_white = (NdotH_key ** 16.0)[:, :, None] * 0.50 + (NdotH_key ** 64.0)[:, :, None] * 0.50
shaded_white = color_white * (ambient_white + diffuse_white) + spec_white

shaded = np.zeros((H, W, 3), dtype=np.float32)
shaded[in_orange] = shaded_orange[in_orange]
shaded[in_crack] = shaded_white[in_crack]
shaded = np.clip(shaded, 0.0, 1.0) * 255.0

# 100% SOLID ALPHA across the entire squircle (both orange body AND white crack)
alpha = np.clip(dist_outer * 2.0, 0.0, 1.0) * 255.0

out_rgba = np.zeros((H, W, 4), dtype=np.uint8)
out_rgba[:, :, :3] = shaded.astype(np.uint8)
out_rgba[:, :, 3] = alpha.astype(np.uint8)

rendered_emblem = Image.fromarray(out_rgba, 'RGBA')
rendered_emblem.save(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_pbr_3d_emblem.png')
print('Flawless Solid PBR 3D Emblem generated!')
