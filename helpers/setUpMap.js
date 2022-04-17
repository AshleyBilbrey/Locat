const constructMap = () => {
    // all data that needs to go to the map page will be stored in this mapdata object
    let mapData = {};
    // specify any external js files here
    // mapData.libs = ['maptest'];
    // specify any external css files here
    mapData.styles = ['map'];

    mapData.zoomLevel = 15;

    const gapiOptions = [
        "key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg",
        "callback=initMap",
        "v=weekly",
    ];
    let gapiString = ''
    gapiOptions.forEach(e => gapiString += e + "&");

    mapData.markerIconUrl = "https://cdn.discordapp.com/attachments/963907404007870566/965097763912183828/HackDavis22MapPin-13.png";
    mapData.gapiOptions = gapiString;

    return mapData;
}

export default constructMap