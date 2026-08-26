import { advertisingCampaigns } from '../stadium/pitch/advertisingCampaigns';

export function CreatorLinks() {
  return (
    <nav className="creator-links" aria-label="HickoDev creator links">
      {advertisingCampaigns.map((campaign, index) => (
        <a
          className={
            index === 0
              ? 'creator-link creator-link--primary'
              : index === 1
                ? 'creator-link creator-link--wide'
                : 'creator-link'
          }
          href={campaign.href}
          key={campaign.id}
          rel="noreferrer"
          target="_blank"
        >
          <span>
            <strong>
              {campaign.id === 'itch'
                ? 'Play games'
                : campaign.id === 'github'
                  ? 'View code'
                  : `Contact me on ${campaign.id}`}
            </strong>
            <small>{campaign.address.toLowerCase()}</small>
          </span>
          <b aria-hidden="true">↗</b>
        </a>
      ))}
    </nav>
  );
}
