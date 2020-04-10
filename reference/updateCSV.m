function updateCSV(lineups)

[null, null, csv] = xlsread('DKSalaries (1).csv');
lc = 0;
for index = 1:size(lineups,1)
    csv(index+1,1:7) = lineups(index,1:7);
end

cell2csv('DKLineups.csv',csv);

end