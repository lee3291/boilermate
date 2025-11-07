import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Master preference options that will be available to all users
const PREFERENCE_OPTIONS = [
  // LIFESTYLE category
  { category: 'LIFESTYLE', label: 'Early Bird', value: 'EARLY_BIRD', mustHave: false },
  { category: 'LIFESTYLE', label: 'Night Owl', value: 'NIGHT_OWL', mustHave: false },
  { category: 'LIFESTYLE', label: 'Clean & Organized', value: 'CLEAN_ORGANIZED', mustHave: false },
  { category: 'LIFESTYLE', label: 'Relaxed About Mess', value: 'RELAXED_MESS', mustHave: false },
  { category: 'LIFESTYLE', label: 'Quiet Environment', value: 'QUIET', mustHave: false },
  { category: 'LIFESTYLE', label: "Doesn't Mind Noise", value: 'NOISE_OK', mustHave: false },
  { category: 'LIFESTYLE', label: 'Work from Home', value: 'WORK_FROM_HOME', mustHave: false },
  { category: 'LIFESTYLE', label: 'Office Worker', value: 'OFFICE_WORKER', mustHave: false },

  // SOCIAL category
  { category: 'SOCIAL', label: 'Love Having Guests', value: 'LOVES_GUESTS', mustHave: false },
  { category: 'SOCIAL', label: 'Prefer No Guests', value: 'NO_GUESTS', mustHave: false },
  { category: 'SOCIAL', label: 'Social Butterfly', value: 'SOCIAL_BUTTERFLY', mustHave: false },
  { category: 'SOCIAL', label: 'Homebody', value: 'HOMEBODY', mustHave: false },
  { category: 'SOCIAL', label: 'Introvert', value: 'INTROVERT', mustHave: false },
  { category: 'SOCIAL', label: 'Extrovert', value: 'EXTROVERT', mustHave: false },

  // HABITS category
  { category: 'HABITS', label: 'Non-Smoker', value: 'NON_SMOKER', mustHave: true },
  { category: 'HABITS', label: 'Smoker', value: 'SMOKER', mustHave: true },
  { category: 'HABITS', label: 'Non-Drinker', value: 'NON_DRINKER', mustHave: false },
  { category: 'HABITS', label: 'Social Drinker', value: 'SOCIAL_DRINKER', mustHave: false },
  { category: 'HABITS', label: 'Regular Drinker', value: 'REGULAR_DRINKER', mustHave: false },

  // PETS category
  { category: 'PETS', label: 'Has Pets', value: 'HAS_PETS', mustHave: true },
  { category: 'PETS', label: 'No Pets', value: 'NO_PETS', mustHave: true },
  { category: 'PETS', label: 'Allergic to Pets', value: 'PET_ALLERGIC', mustHave: true },
  { category: 'PETS', label: 'Pet Lover', value: 'PET_LOVER', mustHave: false },

  // CLEANLINESS category
  { category: 'CLEANLINESS', label: 'Very Tidy', value: 'VERY_TIDY', mustHave: false },
  { category: 'CLEANLINESS', label: 'Moderately Clean', value: 'MODERATE_CLEAN', mustHave: false },
  { category: 'CLEANLINESS', label: 'Casual About Cleaning', value: 'CASUAL_CLEAN', mustHave: false },

  // COOKING category
  { category: 'COOKING', label: 'Loves Cooking', value: 'LOVES_COOKING', mustHave: false },
  { category: 'COOKING', label: 'Occasional Cook', value: 'OCCASIONAL_COOK', mustHave: false },
  { category: 'COOKING', label: 'Rarely Cooks', value: 'RARELY_COOKS', mustHave: false },
  { category: 'COOKING', label: 'Vegetarian', value: 'VEGETARIAN', mustHave: false },
  { category: 'COOKING', label: 'Vegan', value: 'VEGAN', mustHave: false },

  // SCHEDULE category
  { category: 'SCHEDULE', label: 'Flexible Schedule', value: 'FLEXIBLE_SCHEDULE', mustHave: false },
  { category: 'SCHEDULE', label: 'Regular 9-5', value: 'REGULAR_9_5', mustHave: false },
  { category: 'SCHEDULE', label: 'Night Shift Worker', value: 'NIGHT_SHIFT', mustHave: false },
  { category: 'SCHEDULE', label: 'Student', value: 'STUDENT', mustHave: false },

  // MUSIC category
  { category: 'MUSIC', label: 'Plays Instruments', value: 'PLAYS_INSTRUMENTS', mustHave: false },
  { category: 'MUSIC', label: 'Listens Loud Music', value: 'LOUD_MUSIC', mustHave: false },
  { category: 'MUSIC', label: 'Prefers Quiet', value: 'PREFERS_QUIET', mustHave: false },

  // BUDGET category
  { category: 'BUDGET', label: 'Budget Conscious', value: 'BUDGET_CONSCIOUS', mustHave: false },
  { category: 'BUDGET', label: 'Moderate Spender', value: 'MODERATE_SPENDER', mustHave: false },
  { category: 'BUDGET', label: 'Comfortable Spending', value: 'COMFORTABLE_SPENDING', mustHave: false },
];

export async function seedPreferences() {
  console.log('🌱 Seeding preferences...');

  try {
    // Use upsert to avoid duplicates on re-running seeds
    for (const pref of PREFERENCE_OPTIONS) {
      await prisma.preference.upsert({
        where: {
          category_value: {
            category: pref.category,
            value: pref.value,
          },
        },
        update: {
          label: pref.label,
          mustHave: pref.mustHave,
        },
        create: {
          category: pref.category,
          label: pref.label,
          value: pref.value,
          mustHave: pref.mustHave,
        },
      });
    }

    console.log(`✅ Seeded ${PREFERENCE_OPTIONS.length} preferences`);
  } catch (error) {
    console.error('❌ Error seeding preferences:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedPreferences()
    .then(() => {
      console.log('✅ Preference seeding completed');
      prisma.$disconnect();
    })
    .catch((error) => {
      console.error('❌ Preference seeding failed:', error);
      prisma.$disconnect();
      process.exit(1);
    });
}
