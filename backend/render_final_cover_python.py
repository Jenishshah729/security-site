import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

# 1. Load original Image 1
raw_bg = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/6b69f536-f8f4-4e04-b189-39701c0c3532/burp_suite_v2_1790261795579.jpg').convert('RGB')
w, h = raw_bg.size
arr_bg = np.array(raw_bg, dtype=np.float32)

# 2. Inpaint bug strictly within faceplate interior: y in [515, 670], x in [325, 470]
# Division line runs from (393, 515) to (402, 670)
for y in range(515, 670):
    x_div = int(393 + (y - 515) * (402 - 393) / (670 - 515))
    slate_val = arr_bg[y, 318]
    orange_val = arr_bg[y, 475]
    for x in range(325, x_div):
        arr_bg[y, x] = slate_val
    for x in range(x_div, 470):
        arr_bg[y, x] = orange_val

# Smooth only inside the inpainted box
mask = np.zeros((h, w), dtype=bool)
mask[515:670, 325:470] = True
smooth_bg = ndimage.gaussian_filter(arr_bg, sigma=(2.0, 2.0, 0))
arr_bg[mask] = smooth_bg[mask]

pristine_bg = Image.fromarray(arr_bg.astype(np.uint8)).convert('RGBA')

# 3. Load crisp 3D PBR emblem
emblem = Image.open(r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_pbr_3d_emblem.png')

target_w = 280
target_h = 280
emblem_scaled = emblem.resize((target_w, target_h), Image.LANCZOS)
ew, eh = emblem_scaled.size

# 4. 3D Perspective Homography matching badge plane in Image 1
pad = 60
W_box = ew + pad * 2
H_box = eh + pad * 2

p_tl = np.array([pad + 5.0, pad + 0.0])
p_tr = np.array([pad + ew - 18.0, pad + 48.0])
p_br = np.array([pad + ew + 24.0, pad + eh + 30.0])
p_bl = np.array([pad + 40.0, pad + eh - 6.0])

src_pts = np.float32([[0, 0], [ew, 0], [ew, eh], [0, eh]])
dst_pts = np.float32([p_tl, p_tr, p_br, p_bl])

def get_perspective_transform(src, dst):
    A = []
    for i in range(4):
        x, y = src[i, 0], src[i, 1]
        u, v = dst[i, 0], dst[i, 1]
        A.append([x, y, 1, 0, 0, 0, -u*x, -u*y, -u])
        A.append([0, 0, 0, x, y, 1, -v*x, -v*y, -v])
    A = np.array(A)
    _, _, Vh = np.linalg.svd(A)
    H_mat = Vh[-1].reshape((3, 3))
    return H_mat / H_mat[2, 2]

H_inv = np.linalg.inv(get_perspective_transform(src_pts, dst_pts))

y_coords, x_coords = np.mgrid[0:H_box, 0:W_box]
coords = np.vstack([x_coords.ravel(), y_coords.ravel(), np.ones(W_box * H_box)])
src_mapped = H_inv @ coords
src_x = (src_mapped[0] / src_mapped[2]).reshape((H_box, W_box))
src_y = (src_mapped[1] / src_mapped[2]).reshape((H_box, W_box))

emblem_arr = np.array(emblem_scaled, dtype=np.float32)
warped_emblem = np.zeros((H_box, W_box, 4), dtype=np.uint8)

for c in range(4):
    warped_c = ndimage.map_coordinates(emblem_arr[:, :, c], [src_y, src_x], order=2, mode='constant', cval=0.0)
    warped_emblem[:, :, c] = np.clip(warped_c, 0, 255).astype(np.uint8)

warped_img = Image.fromarray(warped_emblem, 'RGBA')

# 5. Soft Contact Shadow & Ambient Occlusion
alpha_channel = Image.fromarray(warped_emblem[:, :, 3])
shadow_mask = alpha_channel.filter(ImageFilter.GaussianBlur(radius=12))

shadow_arr = np.zeros((H_box, W_box, 4), dtype=np.uint8)
shadow_alpha = np.array(shadow_mask)

sh_dx, sh_dy = 10, 14
shadow_arr[sh_dy:, sh_dx:, 3] = (shadow_alpha[:-sh_dy, :-sh_dx] * 0.85).astype(np.uint8)
shadow_arr[:, :, :3] = [10, 8, 6]
shadow_layer = Image.fromarray(shadow_arr, 'RGBA')

# 6. Composite onto Pristine Background
center_x = 398
center_y = 590

dest_x = int(center_x - W_box / 2)
dest_y = int(center_y - H_box / 2)

comp = pristine_bg.copy()
# Paste shadow
comp.paste(shadow_layer, (dest_x, dest_y), shadow_layer)
# Paste 3D emblem
comp.paste(warped_img, (dest_x, dest_y), warped_img)

final_rgb = comp.convert('RGB')

out_path = r'C:/Users/Admin/.gemini/antigravity-ide/brain/fefe4294-e657-497d-ac9b-aff161e5f6dd/burp_suite_3d_cover_final.jpg'
final_rgb.save(out_path, quality=100)

public_dest = r'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/public/burp-suite.jpg'
dist_dest = r'C:/Users/Admin/OneDrive/Pictures/Documents/thejenishshah/frontend/dist/burp-suite.jpg'
final_rgb.save(public_dest, quality=100)
final_rgb.save(dist_dest, quality=100)

print('Master Burp Suite 3D cover successfully created and deployed!')
