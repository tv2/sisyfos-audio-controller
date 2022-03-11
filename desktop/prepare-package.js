const rootPackage = require('../package.json')
const electronPackage = require('./package.json')
const fs = require('fs')

const newPackage = { ...electronPackage }
newPackage.version = rootPackage.version
newPackage.description = rootPackage.description
newPackage.license = rootPackage.license
newPackage.author = rootPackage.author
newPackage.contributors = rootPackage.contributors
newPackage.build.productName = rootPackage.name
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')

try {
    if (JSON.stringify(newPackage) !== JSON.stringify(electronPackage)) {
        fs.writeFileSync(
            './package.json',
            JSON.stringify(newPackage, null, 4),
            'utf-8'
        )
    }
} catch (error) {
    console.error(error)
}
