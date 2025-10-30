import { User } from "../entities/User";
import { psychicSettingRepository } from "../repositories/PsychicSettingRepository";
import { userRepository } from "../repositories/UserRepository";

export class PsychicSettingService {
    async getPsychicSettings(psychicId: number) {
        return await psychicSettingRepository.findOne({ where: { user: { id: psychicId } } });
    }

    async updatePsychicSettings(psychicId: number, bio: string, image: string, minuteRate: string) {
        let psychicSettings = await psychicSettingRepository.findOne({ where: { user: { id: psychicId } } });
        if (!psychicSettings) {
            const user = await userRepository.findOne({ where: { id: psychicId } });
            if (!user) {
                throw new Error("Psychic not found");
            }
            psychicSettings = psychicSettingRepository.create({ user, bio, image, minuteRate: parseFloat(minuteRate) });
        } else {
            psychicSettings.bio = bio;
            psychicSettings.image = image;
            psychicSettings.minuteRate = parseFloat(minuteRate);
        }
        return await psychicSettingRepository.save(psychicSettings);
    }
}
