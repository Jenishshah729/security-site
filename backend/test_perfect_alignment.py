import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

# 1. Load original Image 1
raw_bg = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v2_1790261795579.jpg').convert('RGB')
w, h = raw_bg.size
arr_bg = np.array(raw_bg, dtype=np.float32)

# 2. Inpaint the bug on the faceplate
# The bug in img1 is centered around (419, 619), roughly in x in [320, 520], y in [500, 730]
# The division line runs from (390, 500) to (408, 735)
for y in range(500, 735):
    x_div = int(390 + (y - 500) * (408 - 390) / (735 - 500))
    slate_val = arr_bg[y, 305]
    orange_val = arr_bg[y, 530]
    for x in range(320, x_div):
        arr_bg[y, x] = slate_val
    for x in range(x_div, 515):
        arr_bg[y, x] = orange_val

mask = np.zeros((h, w), dtype=bool)
mask[500:735, 320:515] = True
smooth_bg = ndimage.gaussian_filter(arr_bg, sigma=(2.5, 2.5, 0))
arr_bg[mask] = smooth_bg[mask]

pristine_bg = Image.fromarray(arr_bg.astype(np.uint8)).convert('RGBA')

# 3. Load our 3D PBR emblem
emblem = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_pbr_3d_emblem.png')
ew, eh = emblem.size

# The 4 corners of the box faceplate in img1:
# Corner 1 (Top-Left):     (255, 525)
# Corner 2 (Top-Right):    (520, 490)
# Corner 3 (Bottom-Right): (570, 715)
# Corner 4 (Bottom-Left):  (330, 745)
# Center: (419, 619)

def warp_emblem_to_corners(emblem_img, dst_corners, out_size):
    ew, eh = emblem_img.size
    src_pts = np.float32([[0, 0], [ew, 0], [ew, eh], [0, eh]])
    dst_pts = np.float32(dst_corners)
    
    A = []
    for i in range(4):
        x, y = src_pts[i, 0], src_pts[i, 1]
        u, v = dst_pts[i, 0], dst_pts[i, 1]
        A.append([x, y, 1, 0, 0, 0, -u*x, -u*y, -u])
        A.append([0, 0, 0, x, y, 1, -v*x, -v*y, -v])
    A = np.array(A)
    _, _, Vh = np.linalg.svd(A)
    H_mat = Vh[-1].reshape((3, 3))
    H_mat /= H_mat[2, 2]
    H_inv = np.linalg.inv(H_mat)
    
    out_w, out_h = out_size
    y_coords, x_coords = np.mgrid[0:out_h, 0:out_w]
    coords = np.vstack([x_coords.ravel(), y_coords.ravel(), np.ones(out_w * out_h)])
    src_mapped = H_inv @ coords
    src_x = (src_mapped[0] / src_mapped[2]).reshape((out_h, out_w))
    src_y = (src_mapped[1] / src_mapped[2]).reshape((out_h, out_w))
    
    emblem_arr = np.array(emblem_img, dtype=np.float32)
    warped = np.zeros((out_h, out_w, 4), dtype=np.uint8)
    for c in range(4):
        w_c = ndimage.map_coordinates(emblem_arr[:, :, c], [src_y, src_x], order=2, mode='constant', cval=0.0)
        warped[:, :, c] = np.clip(w_c, 0, 255).astype(np.uint8)
    return Image.fromarray(warped, 'RGBA')

# --- TEST 1: Emblem in the Center of the Box (Size ~ 75% of faceplate, where the bug was) ---
# Center is (419, 619). We scale the 4 corners around the center by factor 0.75:
factor = 0.75
corners_center = []
faceplate_corners = [(255, 525), (520, 490), (570, 715), (330, 745)]
cx, cy = 419.0, 619.0

for x, y in faceplate_corners:
    nx = cx + (x - cx) * factor
    ny = cy + (y - cy) * factor
    corners_center.append((nx, ny))

warped_emblem1 = warp_emblem_to_corners(emblem, corners_center, (w, h))

# Drop shadow for emblem
alpha1 = np.array(warped_emblem1)[:, :, 3]
shadow_mask1 = Image.fromarray(alpha1).filter(ImageFilter.GaussianBlur(radius=10))
shadow_arr1 = np.zeros((h, w, 4), dtype=np.uint8)
sh_alpha = np.array(shadow_mask1)
# Shadow offset: slightly right and down
sh_dx, sh_dy = 6, 8
shadow_arr1[sh_dy:, sh_dx:, 3] = (sh_alpha[:-sh_dy, :-sh_dx] * 0.8).astype(np.uint8)
shadow_arr1[:, :, :3] = [12, 10, 8]
shadow_layer1 = Image.fromarray(shadow_arr1, 'RGBA')

comp1 = pristine_bg.copy()
comp1.paste(shadow_layer1, (0, 0), shadow_layer1)
comp1.paste(warped_emblem1, (0, 0), warped_emblem1)
comp1.convert('RGB').save(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/test_aligned_center.jpg', quality=100)

# --- TEST 2: Emblem filling the Faceplate (Size ~ 95% of faceplate) ---
factor2 = 0.95
corners_full = []
for x, y in faceplate_corners:
    nx = cx + (x - cx) * factor2
    ny = cy + (y - cy) * factor2
    corners_full.append((nx, ny))

warped_emblem2 = warp_emblem_to_corners(emblem, corners_full, (w, h))
comp2 = pristine_bg.copy()
comp2.paste(warped_emblem2, (0, 0), warped_emblem2)
comp2.convert('RGB').save(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/test_aligned_full.jpg', quality=100)

print('Both aligned tests saved successfully!')
