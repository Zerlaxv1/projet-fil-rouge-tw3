function attendre(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function attendreTout(msList) {
    // TODO: transformer chaque ms en Promise via attendre(), puis utiliser Promise.all
    return Promise.all(msList.map(ms => attendre(ms)))
}

async function fetchWithCheck(url) {
    // TODO: 1) fetch(url)
    //       2) vérifier response.ok — si false, throw new Error(`HTTP ${response.status}`)
    //       3) retourner response.json()
    let respponse = fetch(url)
    if (await respponse.ok) {
        return response.json()
    } else {
        throw new Error(`HTTP ${response.status}`)
    }

}

module.exports = { attendre, attendreTout, fetchWithCheck }