const csv = require('csv-parser')
const fs = require('fs')
const results = [];

const file='DKSalaries.csv';

const allowNoFPTS = true;
const forceTeamStack = false;

const captainTrimFront = 3;
const captainTrimBack = 0;
const maximumSalaryRemaining = 2800;
const minimumSalaryRemaining = 2100;

const max = 50000;

const skipPlayers = [
  " Hanabii"
];

const skipCaptains = [
  " Sarkis",
  " Panj",
  " Hidan",
  " dyNquedo",
  " Rainbow"
];

const playCaptains = [];

const skipTeams = [];

const skipTeamPlayers = [];

const useTeams = [];

const sortToTeams = (data) => {
  const teams = {};
  const captains = [];
  const teamPlayers = [];
  const teamsRegex = /(.\S{1,})@(.\S{1,})/g;
  data.forEach((player) => {
    const isCaptain = player["Roster Position"] === "CPT";
    if (isCaptain) {
      return;
    }
    if (!allowNoFPTS) {
      const hasPoints = player["AvgPointsPerGame"] !== "0";
      if (!hasPoints) {
        return;
      }
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

    if (newPlayer.Position !== "TEAM") {
      if (skipCaptains.includes(player.Name) || skipCaptains.includes(player.TeamAbbrev)) {
        return;
      }

      if (playCaptains.length > 0 && !playCaptains.includes(player.Name)) {
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
const adcArrays = [
  ["TOP", "JNG", "MID"],
  ["TOP", "JNG", "SUP"],
  ["MID", "JNG", "SUP"],
  ["JNG", "MID", "SUP"]
  // ["TOP", "SUP"],
  // ["TOP", "JNG"],
  // ["TOP", "MID"],
  // ["JNG", "SUP"],
  // ["JNG", "MID"],
  // ["MID", "SUP"]
];

const midArrays = [
  ["TOP", "JNG", "ADC"],
  ["TOP", "JNG", "SUP"],
  ["TOP", "ADC", "SUP"],
  ["JNG", "ADC", "SUP"]
  // ["TOP", "SUP"],
  // ["TOP", "JNG"],
  // ["TOP", "ADC"],
  // ["JNG", "SUP"],
  // ["JNG", "ADC"],
  // ["ADC", "SUP"]
]

const jngArrays = [
  ["TOP", "MID", "ADC"],
  ["TOP", "MID", "SUP"],
  ["TOP", "ADC", "SUP"],
  ["MID", "ADC", "SUP"]
  // ["TOP", "SUP"],
  // ["TOP", "MID"],
  // ["TOP", "ADC"],
  // ["MID", "SUP"],
  // ["MID", "ADC"],
  // ["ADC", "SUP"]
];

const topArrays = [
  ["JNG", "MID", "ADC"],
  ["MID", "ADC", "SUP"],
  ["JNG", "ADC", ]
  // ["JNG", "MID"],
  // ["MID", "ADC"]
];

const supArrays = [
  // ["JNG", "MID"],
  ["TOP", "JNG", "MID"],
  ["JNG", "MID", "ADC"]
  // ["TOP", "JNG"],
  // ["TOP", "MID"]
];

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

  if (salaryStacksRemaining > 3500) {
    teamPlayers.forEach((team) => {
      if (forceTeamStack) {
        if (otherTeam[0].TeamAbbrev !== captain.opponent) {
          return;
        }
        if (team.TeamAbbrev === captain.TeamAbbrev || team.TeamAbbrev === otherTeam[0].TeamAbbrev) {
          return;
        }
      } else {
        if (pairedPlayers.length > 2 && team.TeamAbbrev === captain.TeamAbbrev) {
          return;
        }

        if (otherTeam.length > 3 && team.TeamAbbrev === otherTeam[0].TeamAbbrev) {
          return;
        }

        if (otherTeam[0].TeamAbbrev === captain.TeamAbbrev) {
          return;
        }

        if (team.TeamAbbrev !== captain.TeamAbbrev && team.TeamAbbrev !== otherTeam[0].TeamAbbrev) {
          return;
        }

        if (otherTeam[0].TeamAbbrev === captain.opponent) {
          return;
        }
      }
    
      if (skipTeamPlayers.includes(team.TeamAbbrev)) {
        return;
      }

      const teamSalary = parseInt(team.Salary);
      const teamTotal = salaryStacksTotal + teamSalary;
      const isValidSalaryUpper =  max - teamTotal <= maximumSalaryRemaining;
      const isValidSalaryLower = max - teamTotal >= minimumSalaryRemaining;
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
      adcArrays.forEach((arr) => {
        const {
          returnNames,
          returnIDs
        } = generate(team, captain, captainTeam, arr, teamPlayers);
        options.push(...returnNames);
        optionsIDs.push(...returnIDs);
      });
    });
  }

  if (captain.Position === "MID") {
    Object.values(teams).forEach((team) => {
      midArrays.forEach((arr) => {
        const {
          returnNames,
          returnIDs
        } = generate(team, captain, captainTeam, arr, teamPlayers);
        options.push(...returnNames);
        optionsIDs.push(...returnIDs);
      });
    });
  }
  if (captain.Position === "JNG") {
    Object.values(teams).forEach((team) => {
      jngArrays.forEach((arr) => {
        const {
          returnNames,
          returnIDs
        } = generate(team, captain, captainTeam, arr, teamPlayers);
        options.push(...returnNames);
        optionsIDs.push(...returnIDs);
      });
    });
  }
  if (captain.Position === "TOP") {
    Object.values(teams).forEach((team) => {
      topArrays.forEach((arr) => {
        const {
          returnNames,
          returnIDs
        } = generate(team, captain, captainTeam, arr, teamPlayers);
        options.push(...returnNames);
        optionsIDs.push(...returnIDs);
      });
    });
  }
  if (captain.Position === "SUP") {
    Object.values(teams).forEach((team) => {
      supArrays.forEach((arr) => {
        const {
          returnNames,
          returnIDs
        } = generate(team, captain, captainTeam, arr, teamPlayers);
        options.push(...returnNames);
        optionsIDs.push(...returnIDs);
      });
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
    captains.sort((a, b) => a.captainSalary > b.captainSalary);
    captains.reverse();
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
