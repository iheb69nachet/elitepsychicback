import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';

export async function generateAvatar(name: string): Promise<string> {
    const seed = encodeURIComponent(name);
    const imageUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${seed}`;

    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${name.replace(/\s/g, '_')}.svg`;
    const filePath = path.join(uploadDir, filename);

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    return `/uploads/avatars/${filename}`;
}