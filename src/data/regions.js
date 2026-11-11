// Region pages. Lists are a starting set: confirm against the areas actually serviced.
export const states = {
  qld: {
    code: 'qld', name: 'Queensland', short: 'QLD',
    metaTitle: 'Bushfire Assessments Queensland | BAL & Planning Reports',
    metaDesc: 'Bushfire assessments across Queensland in accordance with AS 3959 and QFES requirements. BAL assessment reports and planning scheme assessments. Call 0439 289 234.',
    lead: 'We provide bushfire assessments across Queensland in accordance with AS 3959 and QFES requirements, including BAL assessment reports and planning scheme assessments.',
    framework: [
      { h: 'How bushfire is regulated in Queensland', p: [
        'Queensland maps bushfire prone areas at state level under the State Planning Policy. Each council then carries that mapping into its planning scheme as a bushfire hazard overlay, with an overlay code that development has to meet.',
        'For building work, homes in a designated bushfire prone area are built to the National Construction Code and AS 3959, using the BAL rating for the site.',
      ] },
      { h: 'What triggers an assessment', list: [
        'Your lot is inside a bushfire hazard overlay in the council planning scheme',
        'A development application for a subdivision or material change of use on mapped land',
        'A building certifier asks for a BAL rating before approving plans',
        'A council information request asks for a site-specific bushfire hazard assessment',
      ] },
      { h: 'The standards we work to', list: [
        'AS 3959 Construction of buildings in bushfire-prone areas',
        'State Planning Policy: natural hazards, risk and resilience (bushfire)',
        'Queensland fire service guidance for bushfire resilient communities',
        'Your local planning scheme bushfire overlay code',
      ] },
    ],
  },
  nsw: {
    code: 'nsw', name: 'New South Wales', short: 'NSW',
    metaTitle: 'Bushfire Assessments NSW | BAL & Bush Fire Reports',
    metaDesc: 'Bushfire assessments across NSW under Planning for Bush Fire Protection 2019 and AS 3959, for new homes, renovations and subdivisions. Call 0439 289 234.',
    lead: 'Building, renovating or subdividing in NSW? Your Bushfire Attack Level shapes what you can build and how. We assess sites across the state under Planning for Bush Fire Protection 2019.',
    framework: [
      { h: 'How bushfire is regulated in New South Wales', p: [
        'Councils in NSW keep a bush fire prone land map certified by the NSW Rural Fire Service. If your land is on that map, development has to comply with Planning for Bush Fire Protection 2019 (PBP).',
        'New homes and alterations are assessed under section 4.14 of the Environmental Planning and Assessment Act. Subdivisions and special fire protection purpose developments, such as schools and aged care, need a Bush Fire Safety Authority from the RFS under section 100B of the Rural Fires Act.',
      ] },
      { h: 'What triggers an assessment', list: [
        'Your land is on the bush fire prone land map (it is noted on the planning certificate)',
        'A development application for a dwelling, alteration or addition on mapped land',
        'A complying development certificate, which needs a BAL certificate and is not available at BAL-40 or BAL-FZ',
        'A subdivision or special fire protection purpose development',
      ] },
      { h: 'The standards we work to', list: [
        'Planning for Bush Fire Protection 2019',
        'AS 3959 Construction of buildings in bushfire-prone areas',
        'Environmental Planning and Assessment Act 1979, section 4.14',
        'Rural Fires Act 1997, section 100B',
      ] },
    ],
  },
};

export const regions = [
  // ---------------- Queensland ----------------
  { state: 'qld', slug: 'brisbane', name: 'Brisbane', councils: ['Brisbane City Council'],
    intro: 'Brisbane has more bushland inside its boundary than most capital cities, and the bushfire overlay follows it: the D\'Aguilar Range foothills, Mount Coot-tha, Toohey Forest and the bayside reserves all put nearby homes on mapped land.',
    local: 'Suburbs such as The Gap, Brookfield, Pullenvale, Upper Kedron, Chandler and Burbank commonly carry the overlay. Steep, forested slopes below a house are the usual reason a rating comes out higher than an owner expects, so slope is measured carefully on these sites.' },
  { state: 'qld', slug: 'gold-coast', name: 'Gold Coast', councils: ['City of Gold Coast'],
    intro: 'Behind the coastal strip, the Gold Coast rises quickly into forested hinterland. Homes in Tallebudgera Valley, Currumbin Valley, Mudgeeraba, Bonogin, Tamborine and the Springbrook foothills are often inside the bushfire hazard overlay.',
    local: 'Many hinterland lots are acreage with long driveways, so access and firefighting water supply tend to matter as much as the BAL rating itself. We address both in the same report.' },
  { state: 'qld', slug: 'sunshine-coast', name: 'Sunshine Coast', councils: ['Sunshine Coast Council', 'Noosa Shire Council'],
    intro: 'From the Glass House Mountains through the Blackall Range to Noosa, the Sunshine Coast mixes eucalypt forest, coastal heath and wallum close to housing. Heath and wallum burn fast and are assessed differently from forest.',
    local: 'Areas such as Peregian, Doonan, Eumundi, Maleny, Mooloolah and Beerwah regularly need assessments for new homes and rural residential subdivision.' },
  { state: 'qld', slug: 'toowoomba', name: 'Toowoomba', councils: ['Toowoomba Regional Council'],
    intro: 'Toowoomba sits on the edge of the Great Dividing Range, and the escarpment is the main bushfire feature. Properties along the range at Mount Lofty, Prince Henry Heights, Rangeville, Blue Mountain Heights and Highfields face steep, forested slopes.',
    local: 'Fire running uphill toward a house on an escarpment is a worst case under AS 3959, so the effective slope under the vegetation drives many ratings here.' },
  { state: 'qld', slug: 'southern-downs-granite-belt', name: 'Southern Downs & Granite Belt', councils: ['Southern Downs Regional Council'],
    intro: 'Stanthorpe, Warwick and the Granite Belt combine dry eucalypt forest, granite country and long rural interfaces. The region is close to our Tenterfield office, just across the border.',
    local: 'Rural dwellings, farm stay accommodation and boundary realignments make up much of the work here. Static water supply and access for fire appliances are common conditions on rural approvals.' },
  { state: 'qld', slug: 'scenic-rim', name: 'Scenic Rim', councils: ['Scenic Rim Regional Council'],
    intro: 'The Scenic Rim takes in Tamborine Mountain, Beaudesert, Boonah and the ranges along the border. Forested national parks and steep terrain put a large share of rural and rural residential land inside the overlay.',
    local: 'Tourism accommodation is a frequent application type in the region, and uses that bring visitors onto a site are looked at closely for evacuation and access.' },
  { state: 'qld', slug: 'logan', name: 'Logan', councils: ['Logan City Council'],
    intro: 'Logan is one of the fastest growing parts of South East Queensland, with new estates pushing into bushland at Greenbank, Park Ridge, Logan Village, Yarrabilba and Cedar Creek.',
    local: 'Subdivision assessments here often focus on staging: a lot that backs onto bush today may be surrounded by houses once later stages are built, and the assessment needs to reflect both situations.' },
  { state: 'qld', slug: 'ipswich', name: 'Ipswich', councils: ['Ipswich City Council'],
    intro: 'Ipswich growth areas at Ripley, Springfield, Redbank Plains and Pine Mountain sit beside conservation estates and dry eucalypt woodland, including the Flinders Peak and White Rock areas.',
    local: 'Open woodland with a grassy understorey is typical. It is classified differently from dense forest, and the correct classification can change a rating by a full level.' },

  // ---------------- New South Wales ----------------
  { state: 'nsw', slug: 'tenterfield-new-england', name: 'Tenterfield & New England', councils: ['Tenterfield Shire Council', 'Glen Innes Severn Council', 'Armidale Regional Council', 'Inverell Shire Council'],
    intro: 'Tenterfield is home to our northern office. The New England tablelands are high, dry and heavily timbered in places, and the 2019 fire season showed how exposed many rural properties are.',
    local: 'Most work in the region is for rural dwellings, sheds converted to dwellings, and rural subdivision. Being local means site visits are quick to arrange.' },
  { state: 'nsw', slug: 'northern-rivers', name: 'Northern Rivers', councils: ['Tweed Shire Council', 'Byron Shire Council', 'Ballina Shire Council', 'Lismore City Council', 'Kyogle Council', 'Richmond Valley Council', 'Clarence Valley Council'],
    intro: 'The Northern Rivers runs from coastal heath at Byron and Evans Head to wet and dry forest around Nimbin, Kyogle and the Border Ranges. Rainforest is treated differently from eucalypt forest under Planning for Bush Fire Protection.',
    local: 'Rural land sharing communities, secondary dwellings and tourist cabins are common here, and each has its own requirements under PBP 2019.' },
  { state: 'nsw', slug: 'mid-north-coast', name: 'Mid North Coast', councils: ['Coffs Harbour City Council', 'Bellingen Shire Council', 'Nambucca Valley Council', 'Kempsey Shire Council', 'Port Macquarie-Hastings Council'],
    intro: 'Between the Great Dividing Range and the coast, the Mid North Coast has forest running almost to the beach in places. State forest and national park adjoin many residential and rural residential areas.',
    local: 'Coastal villages with a single road in and out need particular attention to access when a new subdivision or tourist development is proposed.' },
  { state: 'nsw', slug: 'sydney', name: 'Sydney', councils: ['Hornsby Shire Council', 'Ku-ring-gai Council', 'Northern Beaches Council', 'The Hills Shire Council', 'Sutherland Shire Council'],
    intro: 'Sydney is ringed and threaded by sandstone bushland. Suburbs along the national parks to the north and south, and the ridgelines above Middle Harbour and the Lane Cove and Georges rivers, are widely mapped as bush fire prone.',
    local: 'Sydney sites are often small lots with houses built along a ridge above a bushland gully. Alterations and additions make up much of the work, and knockdown rebuilds frequently need a fresh assessment.' },
  { state: 'nsw', slug: 'blue-mountains', name: 'Blue Mountains', councils: ['Blue Mountains City Council'],
    intro: 'The Blue Mountains towns sit along a ridge surrounded by World Heritage bushland. A very large share of residential land is bush fire prone, and ratings of BAL-40 and BAL-FZ are more common here than almost anywhere in the state.',
    local: 'On lots where a compliant asset protection zone cannot fit, the assessment looks at what combination of construction standard and site measures can still achieve an acceptable outcome.' },
  { state: 'nsw', slug: 'central-coast', name: 'Central Coast', councils: ['Central Coast Council'],
    intro: 'National parks, state forest and coastal reserves break up the Central Coast between Gosford, Wyong and the coast. Many streets back directly onto bushland.',
    local: 'Sloping sandstone blocks around Kariong, Umina, Killcare, Copacabana and the valleys west of the M1 regularly need BAL assessments for new homes and extensions.' },
  { state: 'nsw', slug: 'hunter', name: 'Hunter', councils: ['Lake Macquarie City Council', 'City of Newcastle', 'Cessnock City Council', 'Maitland City Council', 'Port Stephens Council'],
    intro: 'The Hunter combines lakeside and coastal bushland around Lake Macquarie and Port Stephens with dry forest through Cessnock and the vineyards.',
    local: 'Growth areas on the urban fringe generate steady subdivision work, while rural tourism around Pokolbin brings accommodation proposals that are assessed as special fire protection purpose development.' },
  { state: 'nsw', slug: 'illawarra-shoalhaven', name: 'Illawarra & Shoalhaven', councils: ['Wollongong City Council', 'Shellharbour City Council', 'Kiama Municipal Council', 'Shoalhaven City Council'],
    intro: 'The Illawarra escarpment runs the length of the region directly behind the suburbs, and the Shoalhaven has coastal villages surrounded by forest. The Shoalhaven was heavily affected in the 2019-20 fire season.',
    local: 'Rebuilds and new homes in villages south of Nowra often sit at the higher end of the BAL scale, so construction detailing and product selection are a large part of the advice.' },
];

export const regionsOf = (state) => regions.filter((r) => r.state === state);
