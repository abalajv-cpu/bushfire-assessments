// Business details. Phone, email and parent company taken from the Facebook pages and agilus.com.au.
export const site = {
  name: 'Bushfire Assessments',
  brands: { qld: 'Bushfire Assessments Queensland', nsw: 'Bushfire Assessments New South Wales' },
  stateNames: { qld: 'Queensland', nsw: 'New South Wales' },
  phone: '0439 289 234',
  phoneHref: 'tel:+61439289234',
  email: 'admin@agilus.com.au',
  parent: { name: 'Agilus', url: 'https://agilus.com.au' },
  office: 'Tenterfield, NSW',
  social: {
    qld: 'https://www.facebook.com/bushfireassessmentsqueensland/',
    nsw: 'https://www.facebook.com/profile.php?id=100093097912334',
  },
};

export const nav = [
  { label: 'Services', href: '/services/' },
  { label: 'Queensland', href: '/qld/' },
  { label: 'New South Wales', href: '/nsw/' },
  { label: 'Live fires', href: '/bushfires/', live: true },
  { label: 'Articles', href: '/blog/' },
  { label: 'About', href: '/about/' },
];
