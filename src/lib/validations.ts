import { z } from 'zod';

// URL validation helper that allows empty strings
const optionalUrl = z.string().max(500, 'URL too long').refine(
  (val) => val === '' || /^https?:\/\/.+/.test(val),
  { message: 'Must be a valid URL starting with http:// or https://' }
).optional().or(z.literal(''));

// Internship validation schema
export const internshipSchema = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be less than 10,000 characters'),
  requirements: z.string()
    .max(5000, 'Requirements must be less than 5,000 characters')
    .optional()
    .or(z.literal('')),
  duration: z.string()
    .max(50, 'Duration must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  is_paid: z.boolean(),
  salary_info: z.string()
    .max(100, 'Salary info must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(200, 'Location must be less than 200 characters'),
  is_remote: z.boolean(),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  application_deadline: z.string()
    .optional()
    .or(z.literal('')),
});

// Student profile validation schema
export const studentProfileSchema = z.object({
  full_name: z.string()
    .trim()
    .max(100, 'Name must be less than 100 characters'),
  education_level: z.enum(['high_school', 'university', 'graduate', 'other']),
  skills: z.array(z.string().max(50, 'Skill too long')).max(50, 'Maximum 50 skills'),
  interests: z.array(z.string().max(50, 'Interest too long')).max(30, 'Maximum 30 interests'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional().or(z.literal('')),
  bio: z.string().max(2000, 'Bio must be less than 2,000 characters').optional().or(z.literal('')),
  resume_url: z.string().max(500, 'Resume URL too long').optional().or(z.literal('')),
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  twitter_url: optionalUrl,
  portfolio_url: optionalUrl,
  projects: z.array(z.object({
    title: z.string().max(100, 'Project title must be less than 100 characters'),
    description: z.string().max(500, 'Project description must be less than 500 characters').optional().or(z.literal('')),
    url: optionalUrl,
    technologies: z.array(z.string().max(50, 'Technology name too long')).max(20, 'Maximum 20 technologies per project'),
  })).max(20, 'Maximum 20 projects'),
});

// Company profile validation schema
export const companyProfileSchema = z.object({
  company_name: z.string()
    .trim()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  description: z.string()
    .max(5000, 'Description must be less than 5,000 characters')
    .optional()
    .or(z.literal('')),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  website: optionalUrl,
  logo_url: z.string().max(1000, 'Logo URL too long').optional().or(z.literal('')),
});

// Application (cover letter) validation schema
export const applicationSchema = z.object({
  cover_letter: z.string()
    .max(5000, 'Cover letter must be less than 5,000 characters')
    .optional()
    .or(z.literal('')),
});

// Type exports
export type InternshipFormData = z.infer<typeof internshipSchema>;
export type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
