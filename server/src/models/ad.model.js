/**
 * @class Ad
 */
class Ad {
  constructor(adID, adName, adDescription, adCost, adUsername, imageName) {
    this.adID = adID;
    this.adName = adName;
    this.adDescription = adDescription;
    this.adCost = adCost;
    this.adUsername = adUsername;
    this.imageName = imageName;
  }
}

module.exports = Ad;
