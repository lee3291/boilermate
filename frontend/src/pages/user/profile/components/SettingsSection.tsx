import ToggleSwitch from '@/components/ToggleSwitch';

// Define the shape of the settings object based on the Prisma schema
export interface NotificationSettings {
  email_on_follow_profile_update: boolean;
  email_on_follow_new_listing: boolean;
  email_on_listing_outdated: boolean;
  email_on_listing_27days_old: boolean;
}

interface SettingsSectionProps {
  settings: NotificationSettings | null;
  onUpdate: (key: keyof NotificationSettings, enabled: boolean) => void;
  loading: boolean;
}

export default function SettingsSection({
  settings,
  onUpdate,
  loading,
}: SettingsSectionProps) {
  // Loading skeleton
  if (loading || !settings) {
    return (
      <div className='animate-pulse rounded-xl bg-white p-8 shadow-sm'>
        <div className='mb-6 h-8 w-1/3 rounded bg-gray-200'></div>
        <div className='rounded-lg border border-gray-200 p-6'>
          <div className='mb-4 h-6 w-1/4 rounded bg-gray-200'></div>
          <div className='mb-6 h-4 w-1/2 rounded bg-gray-200'></div>
          <div className='space-y-5'>
            <div className='h-10 rounded bg-gray-200'></div>
            <div className='h-10 rounded bg-gray-200'></div>
            <div className='h-10 rounded bg-gray-200'></div>
            <div className='h-10 rounded bg-gray-200'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-xl bg-white p-8 shadow-sm'>
      <h2 className='mb-6 text-3xl font-bold text-gray-800'>
        ⚙️ Account Settings
      </h2>

      {/* Email Notifications Section */}
      <div className='rounded-lg border border-gray-200 p-6'>
        <h3 className='mb-4 text-xl font-semibold text-gray-700'>
          Email Notifications
        </h3>
        <p className='mb-6 text-gray-500'>
          Control which emails you receive from Boilermate.
        </p>

        <div className='space-y-5'>
          {/* Followed Profile Update */}
          <ToggleSwitch
            label='Profile Updates from Followed Users'
            enabled={settings.email_on_follow_profile_update}
            onChange={(enabled) =>
              onUpdate('email_on_follow_profile_update', enabled)
            }
          />

          {/* New Listing from Followed User */}
          <ToggleSwitch
            label='New Listings from Followed Users'
            enabled={settings.email_on_follow_new_listing}
            onChange={(enabled) =>
              onUpdate('email_on_follow_new_listing', enabled)
            }
          />

          {/* Outdated Listing Reminder */}
          <ToggleSwitch
            label='Reminders for Your Outdated Listings'
            enabled={settings.email_on_listing_outdated}
            onChange={(enabled) =>
              onUpdate('email_on_listing_outdated', enabled)
            }
          />

          {/* 27-Day Old Listing Reminder */}
          <ToggleSwitch
            label='Warning for Listings Nearing 30-Day Expiration'
            enabled={settings.email_on_listing_27days_old}
            onChange={(enabled) =>
              onUpdate('email_on_listing_27days_old', enabled)
            }
          />
        </div>
      </div>
    </div>
  );
}
