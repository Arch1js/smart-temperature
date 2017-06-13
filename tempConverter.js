class Converter {
  convertTemp(object) {
    console.log(object.C);
    var tempK = Math.log(10000.0 * ((1024.0 / object.C - 1)));
    tempK = (1 / (0.001129148 + (0.000234125 + (0.0000000876741 * tempK * tempK )) * tempK )).toFixed(2); //  Temp Kelvin
    console.log("Kelvin: " + tempK);
    var tempC = (tempK - 273.15).toFixed(2);// Convert Kelvin to Celcius
    console.log("Celsius: " + tempC);
    var tempF = ((tempC * 9.0)/ 5.0 + 32.0).toFixed(2); // Convert Celcius to Fahrenheit
    console.log("Farenheit: " + tempF);

    var results = {C:tempC, F:tempF, K:tempK};
    return results;
  }
}

module.exports = Converter;
