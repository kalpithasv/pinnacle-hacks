"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                name: 'AI Code Assistant',
                description: 'Revolutionary AI-powered code completion and debugging tool for developers',
                githubUrl: 'https://github.com/example/ai-code-assistant',
                twitterUrl: 'https://twitter.com/aicodeassistant',
                website: 'https://aicodeassistant.com',
                location: 'San Francisco, CA',
                industry: 'Developer Tools',
                stage: 'growth',
                fundingGoal: 5000000,
                currentFunding: 2500000,
                teamSize: 12,
                foundedYear: 2022,
                techScore: 85,
                socialScore: 72,
                overallScore: 80,
                isDiscovered: false,
                tags: ['AI', 'Developer Tools', 'SaaS', 'Machine Learning']
            }
        }),
        prisma.project.create({
            data: {
                name: 'EcoTrack',
                description: 'IoT platform for real-time environmental monitoring and carbon footprint tracking',
                githubUrl: 'https://github.com/example/ecotrack',
                location: 'Austin, TX',
                industry: 'Climate Tech',
                stage: 'early',
                fundingGoal: 2000000,
                currentFunding: 500000,
                teamSize: 8,
                foundedYear: 2023,
                techScore: 78,
                socialScore: 65,
                overallScore: 73,
                isDiscovered: true,
                tags: ['IoT', 'Climate', 'Hardware', 'Sustainability']
            }
        }),
        prisma.project.create({
            data: {
                name: 'HealthSync',
                description: 'Blockchain-based health data platform for secure patient record management',
                githubUrl: 'https://github.com/example/healthsync',
                twitterUrl: 'https://twitter.com/healthsync',
                location: 'Boston, MA',
                industry: 'HealthTech',
                stage: 'mvp',
                fundingGoal: 3000000,
                currentFunding: 800000,
                teamSize: 15,
                foundedYear: 2022,
                techScore: 82,
                socialScore: 58,
                overallScore: 72,
                isDiscovered: false,
                tags: ['Blockchain', 'HealthTech', 'Security', 'Data Privacy']
            }
        }),
        prisma.project.create({
            data: {
                name: 'DataFlow Analytics',
                description: 'Real-time data processing and analytics platform for enterprise customers',
                githubUrl: 'https://github.com/example/dataflow',
                website: 'https://dataflow.analytics',
                location: 'Seattle, WA',
                industry: 'Data Analytics',
                stage: 'growth',
                fundingGoal: 8000000,
                currentFunding: 4000000,
                teamSize: 25,
                foundedYear: 2021,
                techScore: 88,
                socialScore: 75,
                overallScore: 83,
                isDiscovered: false,
                tags: ['Data Analytics', 'Enterprise', 'Real-time', 'Big Data']
            }
        }),
        prisma.project.create({
            data: {
                name: 'GreenTech Solutions',
                description: 'AI-powered energy optimization platform for commercial buildings',
                githubUrl: 'https://github.com/example/greentech',
                twitterUrl: 'https://twitter.com/greentech_sol',
                location: 'Denver, CO',
                industry: 'Climate Tech',
                stage: 'early',
                fundingGoal: 4000000,
                currentFunding: 1200000,
                teamSize: 10,
                foundedYear: 2023,
                techScore: 76,
                socialScore: 68,
                overallScore: 73,
                isDiscovered: true,
                tags: ['AI', 'Energy', 'Climate', 'IoT']
            }
        })
    ]);
    console.log(`✅ Created ${projects.length} projects`);
    await Promise.all([
        prisma.projectMetrics.create({
            data: {
                projectId: projects[0].id,
                githubStars: 1250,
                githubForks: 89,
                githubCommits: 450,
                githubPrs: 67,
                githubIssues: 23,
                twitterFollowers: 3200,
                twitterTweets: 156,
                twitterEngagement: 8.5
            }
        }),
        prisma.projectMetrics.create({
            data: {
                projectId: projects[1].id,
                githubStars: 340,
                githubForks: 45,
                githubCommits: 280,
                githubPrs: 34,
                githubIssues: 12,
                twitterFollowers: 890,
                twitterTweets: 67,
                twitterEngagement: 6.2
            }
        }),
        prisma.projectMetrics.create({
            data: {
                projectId: projects[2].id,
                githubStars: 890,
                githubForks: 67,
                githubCommits: 520,
                githubPrs: 89,
                githubIssues: 34,
                twitterFollowers: 2100,
                twitterTweets: 98,
                twitterEngagement: 7.1
            }
        })
    ]);
    await Promise.all([
        prisma.techScore.create({
            data: {
                projectId: projects[0].id,
                score: 85,
                commitFrequency: 90,
                prQuality: 85,
                issueResolution: 80,
                codeQuality: 85,
                communityEngagement: 80
            }
        }),
        prisma.techScore.create({
            data: {
                projectId: projects[1].id,
                score: 78,
                commitFrequency: 75,
                prQuality: 80,
                issueResolution: 75,
                codeQuality: 80,
                communityEngagement: 70
            }
        }),
        prisma.techScore.create({
            data: {
                projectId: projects[2].id,
                score: 82,
                commitFrequency: 85,
                prQuality: 80,
                issueResolution: 85,
                codeQuality: 80,
                communityEngagement: 75
            }
        })
    ]);
    await Promise.all([
        prisma.socialScore.create({
            data: {
                projectId: projects[0].id,
                score: 72,
                tweetFrequency: 70,
                engagement: 75,
                followerGrowth: 70,
                contentQuality: 75,
                brandAwareness: 70
            }
        }),
        prisma.socialScore.create({
            data: {
                projectId: projects[1].id,
                score: 65,
                tweetFrequency: 60,
                engagement: 65,
                followerGrowth: 60,
                contentQuality: 70,
                brandAwareness: 65
            }
        }),
        prisma.socialScore.create({
            data: {
                projectId: projects[2].id,
                score: 58,
                tweetFrequency: 55,
                engagement: 60,
                followerGrowth: 55,
                contentQuality: 60,
                brandAwareness: 60
            }
        })
    ]);
    const investors = await Promise.all([
        prisma.investor.create({
            data: {
                name: 'Sarah Johnson',
                email: 'sarah@techventures.com',
                company: 'TechVentures Capital',
                title: 'Managing Partner',
                bio: 'Former Google executive with 15+ years in tech investing. Focus on AI, SaaS, and developer tools.',
                location: 'San Francisco, CA',
                investmentRangeMin: 100000,
                investmentRangeMax: 5000000,
                preferredStages: ['early', 'growth'],
                preferredIndustries: ['Developer Tools', 'AI', 'SaaS'],
                portfolio: [projects[0].id, projects[3].id],
                techScoreMin: 70,
                socialScoreMin: 60,
                teamSizeMin: 3,
                foundedYearMin: 2020
            }
        }),
        prisma.investor.create({
            data: {
                name: 'Michael Chen',
                email: 'michael@greenfund.com',
                company: 'Green Future Fund',
                title: 'Investment Director',
                bio: 'Climate tech specialist with deep expertise in sustainable technology and impact investing.',
                location: 'Austin, TX',
                investmentRangeMin: 500000,
                investmentRangeMax: 10000000,
                preferredStages: ['mvp', 'early', 'growth'],
                preferredIndustries: ['Climate Tech', 'Clean Energy', 'Sustainability'],
                portfolio: [projects[1].id, projects[4].id],
                techScoreMin: 65,
                socialScoreMin: 55,
                teamSizeMin: 5,
                foundedYearMin: 2019
            }
        }),
        prisma.investor.create({
            data: {
                name: 'Dr. Emily Rodriguez',
                email: 'emily@healthtech.vc',
                company: 'HealthTech Ventures',
                title: 'Principal',
                bio: 'Medical doctor turned investor, specializing in health technology and digital health solutions.',
                location: 'Boston, MA',
                investmentRangeMin: 250000,
                investmentRangeMax: 3000000,
                preferredStages: ['idea', 'mvp', 'early'],
                preferredIndustries: ['HealthTech', 'MedTech', 'Digital Health'],
                portfolio: [projects[2].id],
                techScoreMin: 75,
                socialScoreMin: 65,
                teamSizeMin: 4,
                foundedYearMin: 2021
            }
        })
    ]);
    console.log(`✅ Created ${investors.length} investors`);
    const matches = await Promise.all([
        prisma.match.create({
            data: {
                investorId: investors[0].id,
                projectId: projects[0].id,
                score: 92,
                reasons: [
                    'Perfect industry alignment (Developer Tools)',
                    'Strong tech score (85/100) meets your minimum (70+)',
                    'Team size (12) exceeds your preference (3+)',
                    'Growth stage matches your investment focus',
                    'Located in your preferred region (San Francisco)'
                ],
                status: 'pending'
            }
        }),
        prisma.match.create({
            data: {
                investorId: investors[1].id,
                projectId: projects[1].id,
                score: 88,
                reasons: [
                    'Climate tech focus aligns with your expertise',
                    'Strong social engagement (65/100)',
                    'Early stage fits your investment criteria',
                    'Growing team with relevant experience',
                    'High potential for environmental impact'
                ],
                status: 'pending'
            }
        }),
        prisma.match.create({
            data: {
                investorId: investors[2].id,
                projectId: projects[2].id,
                score: 85,
                reasons: [
                    'HealthTech sector matches your specialization',
                    'Excellent tech score (82/100)',
                    'MVP stage aligns with your investment focus',
                    'Strong team with medical expertise',
                    'Addresses critical healthcare challenges'
                ],
                status: 'accepted'
            }
        })
    ]);
    console.log(`✅ Created ${matches.length} matches`);
    const discoveries = await Promise.all([
        prisma.geoSocialDiscovery.create({
            data: {
                location: 'San Francisco, CA',
                businessName: 'TechStart Innovations',
                socialMediaUrl: 'https://twitter.com/techstart_sf',
                description: 'AI-powered software development platform for startups',
                industry: 'Developer Tools',
                confidence: 0.85,
                status: 'pending'
            }
        }),
        prisma.geoSocialDiscovery.create({
            data: {
                location: 'Austin, TX',
                businessName: 'GreenTech Solutions',
                socialMediaUrl: 'https://linkedin.com/company/greentech-austin',
                description: 'Sustainable technology solutions for environmental monitoring',
                industry: 'Climate Tech',
                confidence: 0.78,
                status: 'verified'
            }
        }),
        prisma.geoSocialDiscovery.create({
            data: {
                location: 'Boston, MA',
                businessName: 'HealthSync Technologies',
                socialMediaUrl: 'https://facebook.com/healthsync_boston',
                description: 'Digital health platform for patient data management',
                industry: 'HealthTech',
                confidence: 0.82,
                status: 'pending'
            }
        })
    ]);
    console.log(`✅ Created ${discoveries.length} geo-social discoveries`);
    console.log('🎉 Database seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map