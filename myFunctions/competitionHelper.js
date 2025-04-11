const matchCategory = async (categories, user) => {
  let matchedCategories = categories.filter((cat) => {
    if (cat.sex && cat.sex !== user.userSex) return false;

    if (cat.age) {
      const [minAge, maxAge] = cat.age.split("-").map(Number);
      if (!(user.userAge >= minAge && user.userAge <= maxAge)) return false;
    }

    return true;
  });

  // sort by weight first, then by height
  matchedCategories = matchedCategories.sort((a, b) => {
    const weightA = a.weight.includes("+")
      ? parseInt(a.weight, 10)
      : a.weight
      ? parseInt(a.weight, 10)
      : Infinity;
    const weightB = b.weight.includes("+")
      ? parseInt(b.weight, 10)
      : b.weight
      ? parseInt(b.weight, 10)
      : Infinity;
    const heightA = a.height ? parseInt(a.height, 10) : Infinity;
    const heightB = b.height ? parseInt(b.height, 10) : Infinity;

    // prioritize weight first, then height
    return weightA - weightB || heightA - heightB;
  });

  // find the best weight & height match
  let matchedCategory = matchedCategories.find((cat) => {
    const catWeight = cat.weight.includes("+")
      ? parseInt(cat.weight, 10)
      : cat.weight
      ? parseInt(cat.weight, 10)
      : Infinity;
    const catHeight = cat.height ? parseInt(cat.height, 10) : Infinity;

    // if weight is empty, allow it
    if (!cat.weight || cat.weight === "") return true;
    // if height is empty, allow it
    if (!cat.height || cat.height === "") return true;

    // if user's weight is less than or equal, accept
    if (user.userWeight <= catWeight) {
      // if user's height is less than or equal, accept
      if (userHeight <= catHeight) return true;
    }

    return false;
  });

  return matchedCategory ?? false;
};

const transformData = async (inputData) => {
  const result = [];

  inputData.forEach((item) => {
    let genderGroup = result.find((g) => g.gender === item.sex);
    if (!genderGroup) {
      genderGroup = { gender: item.sex, data: [] };
      result.push(genderGroup);
    }

    let ageGroup = genderGroup.data.find((a) => a.age === item.age);
    if (!ageGroup) {
      ageGroup = { age: item.age, data: [] };
      genderGroup.data.push(ageGroup);
    }

    let weightGroup = ageGroup.data.find((w) => w.weight === item.weight);
    if (!weightGroup) {
      weightGroup = { weight: item.weight, data: [] };
      ageGroup.data.push(weightGroup);
    }

    weightGroup.data.push({
      _id: item._id,
      name: item.name,
      height: item.height,
    });
  });

  return result;
};

module.exports = {
  matchCategory,
  transformData,
};
