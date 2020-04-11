const csv = require('csv-parser')
const fs = require('fs')
const results = [];

const file='DKSalaries.csv';

const captainTrimFront = 3;
const captainTrimBack = 12;
const maximumSalaryRemaining = 600;
const minimumSalaryRemaining = 1100;

const max = 50000;

const skipPlayers = [
  " SS",
  " Dread",
  " All iN",
  " Ben",
  " Hoon",
  " Wings",
  " Moonlight",
  " ADD",
  " bless",
  " melody",
  " April",
  " mingjing",
  " Weiwei",
  " Biubiu",
  " Ning",
  " Baolan",
  " Fate",
  " Xiaowei",
  " Quad", //check
  " JunJia",
  " Xinyi",
  " Aodi",
  " xiaoxiang",
  " Khan",
  " Xiao7",
  " Kellin", //ehck
  " Zenit", //check
  " Lava" //check
];

const skipCaptains = [];

const skipTeams = [];

const useTeams = [];

const sortToTeams = (data) => {
  const teams = {};
  const captains = [];
  const teamPlayers = [];
  const teamsRegex = /(.{1,3})@(.{1,3})/g;
  data.forEach((player) => {
    const isCaptain = player["Roster Position"] === "CPT";
    if (isCaptain) {
      return;
    }
    const hasPoints = player["AvgPointsPerGame"] !== "0";
    if (!hasPoints) {
      return;
    }

    if (skipPlayers.includes(player.Name)) {
      return;
    }

    if (skipTeams.includes(player.TeamAbbrev)) {
      return;
    }
    
    if (useTeams.length > 0 && !useTeams.includes(player.TeamAbbrev)) {
      return;
    }

    if (player.Position === "TEAM") {
      teamPlayers.push(player);
    }
    const opponent = player["Game Info"].match(teamsRegex)[0].replace(player.TeamAbbrev, "").replace("@", "").replace(" ", "");
    let newPlayer;
    if (!teams[player.TeamAbbrev]) {
      newPlayer = {
        ...player,
        captainSalary: parseInt(player.Salary, 10) * 1.5
      }
      teams[player.TeamAbbrev] = {};
      teams[player.TeamAbbrev][player.Position] = newPlayer;
      teams[player.TeamAbbrev].opponent = opponent;
    } else {
      newPlayer = {
        ...player,
        captainSalary: parseInt(player.Salary, 10) * 1.5
      };
      if (teams[player.TeamAbbrev][player.Position]) {
        teams[player.TeamAbbrev]["extras"] = {};
        teams[player.TeamAbbrev]["extras"][player.Position] = newPlayer;
      } else {
        teams[player.TeamAbbrev][player.Position] = newPlayer;
      }
    }

    if (newPlayer.Position === "ADC" || newPlayer.Position === "MID" || newPlayer.Position === "JNG") {
      if (skipCaptains.includes(player.Name)) {
        return;
      }
      if (captains.length < 20) {
        captains.push({...newPlayer, opponent});
      }
      captains.sort((a, b) => {
        return parseInt(a.captainSalary) > parseInt(b.captainSalary);
      });

      if (captains[0].captainSalary < newPlayer.captainSalary) {
        captains.splice(0, 1);
        captains.push({...newPlayer, opponent});
      }
    }
  });
  return { teams, captains, teamPlayers };
};

const nameAndID = (person) => {
  return person["Name + ID"];
}

const nameAndTeam = (person) => {
  return person.Name + " - " + person.TeamAbbrev;
}

const orderLineup = (lineup) => {
  const allPOS = ["TOP", "JNG", "MID", "ADC", "SUP", "TEAM"];
  return lineup.sort((a, b) => allPOS.indexOf(a.Position) > allPOS.indexOf(b.Position));
};


// tf two four one
// ft four two one
const tfADC = ["TOP", "JNG", "SUP"];
const ftADC = ["TOP", "JNG", "MID"];

const tfMid = ["TOP", "JNG", "SUP"];
const ftMid=  ["TOP", "ADC", "SUP"];

const tfJungle = ["TOP", "MID", "SUP"];
const ftJungle = ["TOP", "ADC", "SUP"];

// other team
// full captain object
// team of captain
// arr
const generate = (vsTeam, captain, captainTeam, neededPOS, teamPlayers) => {
  const returnNames = [];
  const returnIDs = [];
  const otherPOS = ["TOP", "JNG", "MID", "ADC", "SUP"];
  let pairedSalary = captain.captainSalary;
  let otherSalary = 0;
  const pairedPlayers = neededPOS.map((pos) => {
    const removePOSIndex = otherPOS.indexOf(pos);
    otherPOS.splice(removePOSIndex, 1)
    pairedSalary += parseInt(captainTeam[pos].Salary);
    return captainTeam[pos];
  });

  const otherTeam = otherPOS.map((pos) => {
    otherSalary += parseInt(vsTeam[pos].Salary);
    return vsTeam[pos];
  });

  const stacks = [...pairedPlayers, ...otherTeam];
  const salaryStacksTotal = pairedSalary + otherSalary;
  const salaryStacksRemaining = max - salaryStacksTotal;

  if (salaryStacksRemaining < 8000 && salaryStacksRemaining > 3500) {
    teamPlayers.forEach((team) => {
  
      if (team.TeamAbbrev === captain.opponent) {
        return;
      }

      if (team.TeamAbbrev === captain.TeamAbbrev) {
        return;
      }

      if (team.TeamAbbrev === vsTeam.opponent) {
        return;
      }

      const teamSalary = parseInt(team.Salary);
      const teamTotal = salaryStacksTotal + teamSalary;
      let isValidSalaryLower = max - teamTotal > 0;
      let isValidSalaryUpper = max - teamTotal > 0;
      if (minimumSalaryRemaining > 0 && maximumSalaryRemaining > 0) {
        isValidSalaryUpper =  max - teamTotal <= minimumSalaryRemaining;
        isValidSalaryLower = max - teamTotal >= maximumSalaryRemaining;
      }
      const orderedTeam = orderLineup([...stacks, team]);
      const finalTeam = [captain, ...orderedTeam];
      if (isValidSalaryUpper && isValidSalaryLower) {
        const namesArray = finalTeam.map((pos) => nameAndTeam(pos));
        const idsArray = finalTeam.map((pos) => nameAndID(pos));
        returnNames.push([...namesArray, teamTotal]);
        returnIDs.push(idsArray);
      }
    });
  }
  return { returnNames, returnIDs };
};

const createLines = (captain, teams, teamPlayers) => {
  const options = [];
  const optionsIDs = [];
  const captainTeam = teams[captain.TeamAbbrev];

  if (captain.Position === "ADC") {
    Object.values(teams).forEach((team) => {
      if (team["TEAM"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }
  
      if (team["TEAM"].TeamAbbrev === captain.opponent) {
        return;
      }
      const { 
        returnNames: tfLinesNames,
        returnIDs: tfLinesIDs
      } = generate(team, captain, captainTeam, tfADC, teamPlayers);
      const {
        returnNames: ftLinesNames,
        returnIDs: ftLinesIDs
      } = generate(team, captain, captainTeam, ftADC, teamPlayers);
      options.push(...tfLinesNames, ...ftLinesNames);
      optionsIDs.push(...tfLinesIDs, ...ftLinesIDs);
    });
  }

  if (captain.Position === "MID") {
    Object.values(teams).forEach((team) => {
      if (team["ADC"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }
  
      if (team["ADC"].TeamAbbrev === captain.opponent) {
        return;
      }
      const {
        returnNames: tfLinesNames,
        returnIDs: tfLinesIDs
      } = generate(team, captain, captainTeam, tfMid, teamPlayers);
      const {
        returnNames: ftLinesNames,
        returnIDs: ftLinesIDs
      } = generate(team, captain, captainTeam, ftMid, teamPlayers);
      options.push(...tfLinesNames, ...ftLinesNames);
      optionsIDs.push(...tfLinesIDs, ...ftLinesIDs);
    });
  }

  if (captain.Position === "JNG") {
    Object.values(teams).forEach((team) => {
      if (team["ADC"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }
  
      if (team["ADC"].TeamAbbrev === captain.opponent) {
        return;
      }
      const { 
        returnNames: tfLinesNames,
        returnIDs: tfLinesIDs
      } = generate(team, captain, captainTeam, tfJungle, teamPlayers);
      const {
        returnNames: ftLinesNames,
        returnIDs: ftLinesIDs
      } = generate(team, captain, captainTeam, ftJungle, teamPlayers);
      options.push(...tfLinesNames, ...ftLinesNames);
      optionsIDs.push(...tfLinesIDs, ...ftLinesIDs);
    });
  }

  return { options, optionsIDs };
};
 
fs.createReadStream(file)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    const {
      teams,
      captains,
      teamPlayers
    } = sortToTeams(results);

    const lines = [["CPT","TOP","JNG","MID","ADC","SUP","TEAM", "Total"]];
    const linesIDs = [["CPT","TOP","JNG","MID","ADC","SUP","TEAM", "", ""]];
    console.info(captains.map((captain) => captain.Name));
    captains.reverse();
    console.info(captains.map((captain) => captain.Name));
    useCaptains = captains.splice(captainTrimFront, (captains.length - captainTrimFront) - captainTrimBack);

    console.info(useCaptains.map((captain) => captain.Name));

    useCaptains.forEach((captain) => {
      const { options, optionsIDs } = createLines(captain, teams, teamPlayers);
      if (options && options.length) lines.push(...options);
      if (optionsIDs && optionsIDs.length) linesIDs.push(...optionsIDs);
    });

    fs.writeFile('IDs.csv', linesIDs.join("\r\n"), 'utf8', function (err) {
      if (err) {
        console.log('Some error occured - file either not saved or corrupted file saved.');
      } else{
        console.log('It\'s saved!');
      }
    });

    fs.writeFile('Names.csv', lines.join("\r\n"), 'utf8', function (err) {
      if (err) {
        console.log('Some error occured - file either not saved or corrupted file saved.');
      } else{
        console.log('It\'s saved!');
      }
    });
  });
