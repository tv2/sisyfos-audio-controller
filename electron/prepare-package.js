const rootPackage = require('../package.json')
const electronPackage = require('./package.json')
const fs = require('fs')

electronPackage.name = rootPackage.name
electronPackage.version = rootPackage.version
electronPackage.description = rootPackage.description
electronPackage.license = rootPackage.license
electronPackage.author = rootPackage.author
electronPackage.contributors = rootPackage.contributors
electronPackage.build.productName = electronPackage.name
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')

try {
    fs.writeFileSync(
        './package.json',
        JSON.stringify(electronPackage, null, 4),
        'utf-8'
    )
} catch (error) {
    console.error(error)
}
