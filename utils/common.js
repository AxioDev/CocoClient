const genders = [
    { key: 'man', label: 'Homme' },
    { key: 'woman', label: 'Femme' }
];

const ageFilters = [
    { key: 'young', label: '- 30 ans', range: [0, 30] },
    { key: 'middleAge', 'label': '30 - 50 ans', range: [30, 50] },
    { key: 'old', 'label': '+ 50 ans', range: [50, 200] }
]

module.exports = {
    genders,
    ageFilters
};