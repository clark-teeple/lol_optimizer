programPath = 'C:/Users/Derek/Desktop/DFS/LOL';
downloadsPath = 'C:/Users/Derek/Downloads';

addpath 'C:/Users/Derek/Desktop/DFS/LOL'
addpath 'C:/Users/Derek/Desktop/DFS/LOL/functions'

% Load Players
cd(programPath)
players = loadPlayersFromDK(downloadsPath);
cd(programPath)

% Select Players
selectPlayersSwitch = 3;
if selectPlayersSwitch == 1
    [players, selectedList] = selectPlayers(players);
elseif selectPlayersSwitch == 2
    load('selectedList.mat')
    [players, selectedList] = selectPlayers(players, selectedList);
elseif selectPlayersSwitch == 3
    [players, selectedList] = selectPlayers(players, 'all');
elseif selectPlayersSwitch == 4
    [players, selectedList] = editPlayers(players, selectedList);
end
cd(programPath)
save('selectedList.mat', 'selectedList')

% Select Captains
captainOptionsSwitch = 3;
if captainOptionsSwitch == 1
    [players, captainList] = selectCaptains(players);
elseif captainOptionsSwitch == 2
    load('captainList.mat')
    [players, captainList] = selectCaptains(players, captainList);
elseif captainOptionsSwitch == 3
    [players, captainList] = selectCaptains(players, 'auto');
elseif captainOptionsSwitch == 4
    [players, captainList] = editCaptains(players, captainList);
end
cd(programPath)
save('captainList.mat', 'captainList')

% Create Teams
Teams = createTeams(players);

% Lineups
lineups = createLineups(players, Teams);

% Update DK Upload CSV with lineups
cd(downloadsPath)
updateCSV(lineups);