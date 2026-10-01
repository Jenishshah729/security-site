import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

# 1. Load original Image 1
raw_bg = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v2_1790261795579.jpg').convert('RGB')
w, h = raw_bg.size
arr_bg = np.array(raw_bg, dtype=np.float32)

# 2. Seamless Inpainting of the bug
# Generate the pristine gradient faceplate for y in [490, 725], x in [295, 525]
clean_patch = np.zeros_like(arr_bg)
for y in range(h):
    t = (y - 470.0) / (725.0 - 470.0)
    slate_val = (1.0 - t) * np.array([110, 126, 152]) + t * np.array([45, 56, 76])
    orange_val = (1.0 - t) * np.array([252, 212, 175]) + t * np.array([240, 140, 65])
    
    x_div = int(391 + (y - 490) * (408 - 391) / (725 - 490))
    for x in range(w):
        if x < x_div:
            clean_patch[y, x] = slate_val
        else:
            clean_patch[y, x] = orange_val

# Mask for bug region with smooth feathered edges
mask = np.zeros((h, w), dtype=np.float32)
mask[500:720, 310:515] = 1.0
feathered_mask = ndimage.gaussian_filter(mask, sigma=8.0)[:, :, None]

# Blend pristine gradient into original background
blended_bg_arr = arr_bg * (1.0 - feathered_mask) + clean_patch * feathered_mask
pristine_bg = Image.fromarray(np.clip(blended_bg_arr, 0, 255).astype(np.uint8)).convert('RGBA')

# 3. Load our 3D PBR emblem
emblem = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_pbr_3d_emblem.png')
ew, eh = emblem.size

# The 4 corners of the box faceplate in Image 1:
# Top-Left:     (255, 525)
# Top-Right:    (520, 490)
# Bottom-Right: (570, 715)
# Bottom-Left:  (330, 745)
# Center: (419, 619)

# We scale the emblem corners around center (419, 619)
# A factor of 0.82 makes it sit prominently and handsomely in the center of the box,
# perfectly framed by the metallic chassis while completely replacing the bug.
factor = 0.82
cx, cy = 419.0, 619.0
faceplate_corners = [(255, 525), (520, 490), (570, 715), (330, 745)]

dst_corners = []
for x, y in faceplate_corners:
    nx = cx + (x - cx) * factor
    ny = cy + (y - cy) * factor
    dst_corners.append((nx, ny))

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

warped_emblem = warp_emblem_to_corners(emblem, dst_corners, (w, h))

# 4. Authentic Ambient Occlusion Contact Drop Shadow
alpha = np.array(warped_emblem)[:, :, 3]
shadow_mask = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(radius=12))

shadow_arr = np.zeros((h, w, 4), dtype=np.uint8)
sh_alpha = np.array(shadow_mask)

# Shadow shift: along the box surface plane (+8px right, +10px down)
sh_dx, sh_dy = 8, 10
shadow_arr[sh_dy:, sh_dx:, 3] = (sh_alpha[:-sh_dy, :-sh_dx] * 0.85).astype(np.uint8)
shadow_arr[:, :, :3] = [12, 10, 8]
shadow_layer = Image.fromarray(shadow_arr, 'RGBA')

# 5. Composite Final Image
comp = pristine_bg.copy()
# Paste shadow onto faceplate
comp.paste(shadow_layer, (0, 0), shadow_layer)
# Paste 3D Burp Suite logo emblem
comp.paste(warped_emblem, (0, 0), warped_emblem)

final_rgb = comp.convert('RGB')

out_path = r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_suite_3d_cover_master.jpg'
final_rgb.save(out_path, quality=100)

# Deploy to frontend
public_dest = r'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/public/burp-suite.jpg'
dist_dest = r'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/dist/burp-suite.jpg'
final_rgb.save(public_dest, quality=100)
final_rgb.save(dist_dest, quality=100)

print('Master Burp Suite 3D cover successfully created and deployed!')
