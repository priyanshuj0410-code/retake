"""sRGB <-> CIE Lab (D65), vectorised; the same formulas as SwipeEd's recolor_cheeks.py."""
import numpy as np

M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
WHITE = np.array([0.95047, 1.0, 1.08883])


def srgb2lin(rgb):
    return np.where(rgb > 0.04045, ((rgb + 0.055) / 1.055) ** 2.4, rgb / 12.92)


def lin2srgb(c):
    c = np.clip(c, 0, None)
    return np.clip(np.where(c > 0.0031308, 1.055 * c ** (1 / 2.4) - 0.055, 12.92 * c), 0, 1)


def rgb2lab(rgb):
    xyz = srgb2lin(rgb) @ M.T / WHITE
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def lab2rgb(lab):
    fy = (lab[..., 0] + 16) / 116
    fx, fz = fy + lab[..., 1] / 500, fy - lab[..., 2] / 200
    f = np.stack([fx, fy, fz], -1)
    xyz = np.where(f ** 3 > 0.008856, f ** 3, (f - 16 / 116) / 7.787) * WHITE
    return lin2srgb(xyz @ np.linalg.inv(M).T)


def hex2lab(h):
    return rgb2lab(np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float) / 255)
