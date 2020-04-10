function players = loadPlayersFromDK(downloadsPath)

Players = [];
expAt = '@';
expS = ' ';

cd(downloadsPath)
[null, null, playersRaw] = xlsread('DKSalaries.csv');

playerCount = 1;
players(1,1) = playersRaw(1,1);
players(1,2:3) = playersRaw(1,3:4);
players(1,4:6) = playersRaw(1,6:8);
for index = 2:size(playersRaw,1)
    if ~strcmp(playersRaw{index,5},'CPT')
        playerCount = playerCount + 1;
        players(playerCount,:) = playersRaw(index,1);
        players(playerCount,2:3) = playersRaw(index,3:4);
        players(playerCount,4:6) = playersRaw(index,6:8);
    end
end

players{1,7} = 'Opponent';
for index = 2:size(players,1)
    team = players{index,6};
    gameInfo = players{index,5};
    atInd = regexp(gameInfo,expAt);
    sInd = regexp(gameInfo,expS);
    if strcmp(gameInfo(1:atInd-1), team)
        opponent = gameInfo(atInd+1:sInd(1,1)-1);
    else
        opponent = gameInfo(1:atInd-1);
    end
    players{index,7} = opponent;
end

position = players(2:end,1);
name = players(2:end,2);
ID = players(2:end,3);
salary = players(2:end,4);
team = players(2:end,6);
opponent = players(2:end,7);
playersSorted = table(position, name, ID, salary, team, opponent);
sortedTable = sortrows(playersSorted, [5, 1]);
headers = {'position', 'name', 'ID', 'salary', 'team', 'opponent'};
players = [];
players2 = table2array(sortedTable);
players = vertcat(headers,players2);

end