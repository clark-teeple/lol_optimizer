const csv = require('csv-parser')
const fs = require('fs')
const results = [];

const file='DKSalaries.csv';

const captainTrimFront = 0;
const captainTrimBack = 0;
const salaryCut = 400;
const minimumSalaryCut = 1600;

const fourTwoOne = true;

const skipPlayers = [
  " rat",
  " Uzi",
  " S1xu",
  " bonO",
  " Bademan",
  " Kuma",
  " Plex",
  " yimeng",
  " Lava",
  " fenfen",
  " Keine",
  " FATE",
  " Wuming",
  " Zenit",
  " Trigger",
  " Alu",
  " Chance",
  " Mia",
  " yuekai",
  " CJJ",
  " Ray",
  " Poss",
  " Alphamong"
];

const skipCaptains = [

];

const skipTeams = [

];

const useTeams = [

];

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

const nameIDAndTeam = (person) => {
  return person.Name + " - " + person.TeamAbbrev;
}

const createLines = (captain, teams, teamPlayers) => {
  const max = 50000;
  const options = [];
  const optionsIDs = [];

  if (captain.Position === "ADC") {
    const support = teams[captain.TeamAbbrev]["SUP"];
    const pairSalary = captain.captainSalary + parseInt(support.Salary);
    const newMax = max - pairSalary;

    const neededPOS = ["TOP", "JNG", "MID", "ADC"];
    Object.values(teams).forEach((team) => {
      if (team["ADC"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }

      if (team["ADC"].TeamAbbrev === captain.opponent) {
        return;
      }
      const players = neededPOS.map((pos) => team[pos]);
      const salaries = neededPOS.map((pos) => parseInt(team[pos].Salary));
      const newSalary = salaries.reduce((acc, salary) => acc + salary);
      const remaining = newMax - newSalary;
      const internalOptions = [];
      const internalIDs = [];
      if (remaining < 8000 && remaining > 3500) {
        teamPlayers.forEach((team) => {
          const salaryCondition = parseInt(team.Salary) <= (remaining - salaryCut) && parseInt(team.Salary) >= (remaining - minimumSalaryCut);
          if (players[0].TeamAbbrev === team.TeamAbbrev) {
            return;
          }
          if (team.TeamAbbrev === captain.TeamAbbrev) {
            return;
          }
          if (salaryCondition) {
            const total = pairSalary + newSalary + parseInt(team.Salary);
            internalOptions.push([nameIDAndTeam(captain), ...players.map((player) => nameIDAndTeam(player)), nameIDAndTeam(support), nameIDAndTeam(team), total]);
            const IDs = [nameAndID(captain), ...players.map((player) => nameAndID(player)), nameAndID(team), "", ""];
            IDs.splice(5, 0, nameAndID(support));
            if (IDs.length > 1) internalIDs.push(IDs);
          }
        });
      }
      options.push(...internalOptions);
      optionsIDs.push(...internalIDs);
    });
  }

  if (captain.Position === "JNG") {
    const mid = teams[captain.TeamAbbrev]["MID"];
    const pairSalary = captain.captainSalary + parseInt(mid.Salary);
    const newMax = max - pairSalary;

    const neededPOS = ["TOP", "JNG", "ADC", "SUP"];
    Object.values(teams).forEach((team) => {
      if (team["ADC"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }

      if (team["ADC"].TeamAbbrev === captain.opponent) {
        return;
      }

      const players = neededPOS.map((pos) => team[pos]);
      const salaries = neededPOS.map((pos) => parseInt(team[pos].Salary));
      const newSalary = salaries.reduce((acc, salary) => acc + salary);
      const remaining = newMax - newSalary;
      const internalOptions = [];
      const internalIDs = [];
      if (remaining < 8000 && remaining > 3500) {
        teamPlayers.forEach((team) => {
          if (players[0].TeamAbbrev === team.TeamAbbrev) {
            return;
          }
          if (team.TeamAbbrev === captain.TeamAbbrev) {
            return;
          }
          if (parseInt(team.Salary) <= (remaining - salaryCut) && parseInt(team.Salary) >= (remaining - minimumSalaryCut)) {
            const total = pairSalary + newSalary + parseInt(team.Salary);
            const names = [nameIDAndTeam(captain), ...players.map((player) => nameIDAndTeam(player)), nameIDAndTeam(team), total];
            names.splice(3, 0, nameIDAndTeam(mid));
            if (names.length > 1) internalOptions.push(names);
            const IDs = [nameAndID(captain), ...players.map((player) => nameAndID(player)), nameAndID(team), "", ""];
            IDs.splice(3, 0, nameAndID(mid));
            if (IDs.length > 1) internalIDs.push(IDs);
          }
        });
      }
      options.push(...internalOptions);
      optionsIDs.push(...internalIDs);
    });
  }

  if (captain.Position === "MID") {
    const jungle = teams[captain.TeamAbbrev]["JNG"];
    const pairSalary = captain.captainSalary + parseInt(jungle.Salary);
    const newMax = max - pairSalary;

    const neededPOS = ["TOP", "MID", "ADC", "SUP"];
    Object.values(teams).forEach((team) => {
      if (team["MID"].TeamAbbrev === captain.TeamAbbrev) {
        return;
      }
      if (team["MID"].TeamAbbrev === captain.opponent) {
        return;
      }
      const players = neededPOS.map((pos) => team[pos]);
      const salaries = neededPOS.map((pos) => parseInt(team[pos].Salary));
      const newSalary = salaries.reduce((acc, salary) => acc + salary);
      const remaining = newMax - newSalary;
      const internalOptions = [];
      const internalIDs = [];
      if (remaining < 7000 && remaining > 3500) {
        teamPlayers.forEach((team) => {
          if (players[0].TeamAbbrev === team.TeamAbbrev) {
            return;
          }
          if (team.TeamAbbrev === captain.TeamAbbrev) {
            return;
          }
          if (parseInt(team.Salary) <= (remaining - salaryCut) && parseInt(team.Salary) >= (remaining - minimumSalaryCut)) {
            const total = pairSalary + newSalary + parseInt(team.Salary);
            const names = [nameIDAndTeam(captain), ...players.map((player) => nameIDAndTeam(player)), nameIDAndTeam(team), total];
            names.splice(2, 0, nameIDAndTeam(jungle));
            if (names.length > 1) internalOptions.push(names);
            const IDs = [nameAndID(captain), ...players.map((player) => nameAndID(player)), nameAndID(team), "", ""];
            IDs.splice(2, 0, nameAndID(jungle));
            if (IDs.length > 1) internalIDs.push(IDs);
          }
        });
      }
      options.push(...internalOptions);
      optionsIDs.push(...internalIDs);
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
