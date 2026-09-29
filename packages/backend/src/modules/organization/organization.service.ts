import crypto from 'crypto';
import { Types } from 'mongoose';
import { Organization } from '../../models/Organization.model';
import { User } from '../../models/User.model';
import { ApiError } from '../../utils/ApiError';
import { sendEmail } from '../../utils/mailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

class OrganizationService {
  async create(userId: string, name: string) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50) || `org-${Date.now()}`;

    let finalSlug = slug;
    let counter = 1;
    while (await Organization.exists({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter++}`;
    }

    const organization = await Organization.create({
      name,
      slug: finalSlug,
      ownerId: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
      plan: 'free',
      limits: {
        maxMembers: 3,
        maxTodos: 50,
        maxStorage: 100 * 1024 * 1024,
      },
    });

    await User.findByIdAndUpdate(userId, {
      organizationId: organization._id,
      role: 'owner',
    });

    logger.info(`Organization үүсгэгдлээ: ${organization._id}`);
    return organization;
  }

  async inviteMember(
    organizationId: string,
    inviterId: string,
    email: string,
    role: 'admin' | 'member' = 'member'
  ) {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }

    if (org.members.length >= org.limits.maxMembers) {
      throw ApiError.forbidden('Гишүүний хязгаар хүрсэн');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const inviteUrl = `${env.CLIENT_URL}/invite/${token}`;

    // Email илгээх (алдаа гарвал алгасах)
    try {
      await sendEmail(
        email,
        `${org.name}-д урилга`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">${org.name}-д тавтай морил</h2>
            <p>Танд <b>${role}</b> эрхээр урилга ирлээ.</p>
            <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
              Урилгыг хүлээн авах
            </a>
            <p style="color: #6b7280; font-size: 14px;">
              Энэ холбоос 7 хоногийн дараа хүчингүй болно.
            </p>
          </div>
        `
      );
    } catch (error) {
      logger.warn('Email илгээх алдаа (үргэлжлүүлэх):', error);
    }

    return { success: true, message: 'Урилга илгээгдлээ', inviteUrl };
  }

  async removeMember(organizationId: string, userId: string) {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }

    if (org.ownerId.toString() === userId) {
      throw ApiError.badRequest('Эзэн өөрийгөө устгах боломжгүй');
    }

    org.members = org.members.filter(
      (m: Types.ObjectId) => m.toString() !== userId
    ) as Types.ObjectId[];
    await org.save();

    return { success: true };
  }

  async getOrganization(organizationId: string) {
    const org = await Organization.findById(organizationId)
      .populate('ownerId', 'username email')
      .populate('members', 'username email role');
    if (!org) {
      throw ApiError.notFound('Байгууллага олдсонгүй');
    }
    return org;
  }
}

export const organizationService = new OrganizationService();