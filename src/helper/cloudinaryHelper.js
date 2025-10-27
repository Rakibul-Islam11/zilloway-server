const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
    if (!imageUrl) return null;

    const pathSegments = imageUrl.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1]; // e.g. "yghsbfltnce3qmfreo1p.png"

    // ✅ Extension (.jpg, .jpeg, .png, .webp etc.) remove
    const valueWithoutExtension = lastSegment.replace(/\.[^/.]+$/, "");

    return valueWithoutExtension; // e.g. "yghsbfltnce3qmfreo1p"
};

module.exports = { publicIdWithoutExtensionFromUrl };
