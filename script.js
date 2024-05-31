d3.json("analysis_results.json").then(function(data) {
    data.forEach(function(d) {
        d.color = d.keyword_freq['red'] ? 'red' : d.keyword_freq['yellow'] ? 'yellow' : 'steelblue';
        d.thickness = d.keyword_freq['10'] ? 10 : d.keyword_freq['100'] ? 100 : 1;
        d.sentiment_polarity = d.sentiment[0];
        d.sentiment_subjectivity = d.sentiment[1];
        d.entity_count = d.entities.length;
    });

    var tooltip = d3.select("#tooltip");

    // Radial Topic Map
    var radialWidth = 800;
    var radialHeight = 800;
    var radialOuterRadius = Math.min(radialWidth, radialHeight) / 2 - 10;
    var radialInnerRadius = 100;

    var allKeywords = [];
    data.forEach(d => {
        allKeywords = allKeywords.concat(Object.keys(d.keyword_freq));
    });
    var uniqueKeywords = Array.from(new Set(allKeywords));

    var radialColor = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueKeywords);

    var radialArc = d3.arc()
        .innerRadius(radialInnerRadius)
        .outerRadius(function(d) {
            return radialInnerRadius + (radialOuterRadius - radialInnerRadius) * (d.data.frequency / d3.max(keywordData, function(d) {
                return d.frequency;
            }));
        });

        
    var radialPie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.frequency;
        });

    var radialSvg = d3.select("#radial-topic-map svg")
        .attr("width", radialWidth)
        .attr("height", radialHeight)
        .append("g")
        .attr("transform", "translate(" + radialWidth / 2 + "," + radialHeight / 2 + ")");

    var keywordData = uniqueKeywords.map(keyword => {
        var frequency = 0;
        data.forEach(d => {
            if (d.keyword_freq[keyword]) {
                frequency += d.keyword_freq[keyword];
            }
        });
        return {
            keyword: keyword,
            frequency: frequency
        };
    });

    var radialArcs = radialSvg.selectAll(".arc")
        .data(radialPie(keywordData))
        .enter().append("g")
        .attr("class", "arc");

    radialArcs.append("path")
        .attr("d", radialArc)
        .style("fill", function(d) {
            return radialColor(d.data.keyword);
        })
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(
                "<strong>Keyword:</strong> " + d.data.keyword + "<br/>" +
                "<strong>Frequency:</strong> " + d.data.frequency + "<br/>"
            )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    var legendRadial = radialSvg.append("g")
        .attr("transform", "translate(" + (radialOuterRadius + 20) + ", -" + (radialOuterRadius) + ")");

    uniqueKeywords.forEach((keyword, i) => {
        var legendRow = legendRadial.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");

        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", radialColor(keyword));

        legendRow.append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .style("text-transform", "capitalize")
            .text(keyword);
    });

    // Bar Chart for Number of Words
    var margin = {top: 20, right: 30, bottom: 80, left: 50},
        width = 460 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#bar-chart svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.audio_file;
        }))
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) {
            return d.num_words;
        })])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
            return x(d.audio_file);
        })
        .attr("y", function(d) {
            return y(d.num_words);
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) {
            return height - y(d.num_words);
        })
        .attr("fill", function(d) {
            return d.color;
        })
        .attr("stroke-width", function(d) {
            return d.thickness;
        })
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(
                "<strong>Audio File:</strong> " + d.audio_file + "<br/>" +
                "<strong>Number of Words:</strong> " + d.num_words + "<br/>" +
                "<strong>Sentiment Polarity:</strong> " + d.sentiment_polarity.toFixed(2) + "<br/>" +
                "<strong>Sentiment Subjectivity:</strong> " + d.sentiment_subjectivity.toFixed(2) + "<br/>" 
            )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Sentiment Analysis Heat Map
    var sentimentSvg = d3.select("#sentiment-chart svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var sentimentX = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.audio_file;
        }))
        .range([0, width])
        .padding(0.1);

    var sentimentY = d3.scaleLinear()
        .domain([0, 1]) // Subjectivity ranges from 0 to 1
        .range([height, 0]);

    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
        .domain([-1, 1]); // Polarity ranges from -1 to 1

    sentimentSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(sentimentX))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    sentimentSvg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(sentimentY));

    sentimentSvg.selectAll(".rect")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d) {
            return sentimentX(d.audio_file);
        })
        .attr("y", function(d) {
            return sentimentY(d.sentiment_subjectivity);
        })
        .attr("width", sentimentX.bandwidth())
        .attr("height", function(d) {
            return height - sentimentY(d.sentiment_subjectivity);
        })
        .attr("fill", function(d) {
            return colorScale(d.sentiment_polarity);
        })
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(
                "<strong>Audio File:</strong> " + d.audio_file + "<br/>" +
                "<strong>Sentiment Polarity:</strong> " + d.sentiment_polarity.toFixed(2) + "<br/>" +
                "<strong>Sentiment Subjectivity:</strong> " + d.sentiment_subjectivity.toFixed(2)
            )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Pie Chart for Part-of-Speech Tag Distribution
    var posCounts = data.reduce(function(acc, d) {
        for (var pos in d.pos_counts) {
            if (!acc[pos]) {
                acc[pos] = 0;
            }
            acc[pos] += d.pos_counts[pos];
        }
        return acc;
    }, {});

    var posLabels = {
        "CC": "Coordinating conjunction",
        "CD": "Cardinal number",
        "DT": "Determiner",
        "EX": "Existential there",
        "FW": "Foreign word",
        "IN": "Preposition or subordinating conjunction",
        "JJ": "Adjective",
        "JJR": "Adjective, comparative",
        "JJS": "Adjective, superlative",
        "LS": "List item marker",
        "MD": "Modal",
        "NN": "Noun, singular or mass",
        "NNS": "Noun, plural",
        "NNP": "Proper noun, singular",
        "NNPS": "Proper noun, plural",
        "PDT": "Predeterminer",
        "POS": "Possessive ending",
        "PRP": "Personal pronoun",
        "PRP$": "Possessive pronoun",
        "RB": "Adverb",
        "RBR": "Adverb, comparative",
        "RBS": "Adverb, superlative",
        "RP": "Particle",
        "SYM": "Symbol",
        "TO": "to",
        "UH": "Interjection",
        "VB": "Verb, base form",
        "VBD": "Verb, past tense",
        "VBG": "Verb, gerund or present participle",
        "VBN": "Verb, past participle",
        "VBP": "Verb, non-3rd person singular present",
        "VBZ": "Verb, 3rd person singular present",
        "WDT": "Wh-determiner",
        "WP": "Wh-pronoun",
        "WP$": "Possessive wh-pronoun",
        "WRB": "Wh-adverb"
    };

    var pieData = Object.entries(posCounts);

    var pieSvg = d3.select("#pos-chart svg")
        .attr("width", 500)
        .attr("height", 500)
        .append("g")
        .attr("transform", "translate(250,250)");

    var radius = 200;

    var pie = d3.pie()
        .value(function(d) {
            return d[1];
        });

    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var g = pieSvg.selectAll(".arc")
        .data(pie(pieData))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d, i) {
            return d3.schemeCategory10[i % 10];
        })
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(
                "<strong>Part of Speech:</strong> " + posLabels[d.data[0]] + "<br/>" +
                "<strong>Count:</strong> " + d.data[1]
            )
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Add a legend to the pie chart
    var legend = d3.select("#legend");

    pieData.forEach(function(d, i) {
        var legendItem = legend.append("div")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-bottom", "5px");

        legendItem.append("div")
            .style("width", "18px")
            .style("height", "18px")
            .style("background-color", d3.schemeCategory10[i % 10])
            .style("margin-right", "5px");

        legendItem.append("span")
            .style("font-size", "12px")
            .text(posLabels[d[0]] + " (" + d[0] + ")");
    });


    
    // Bubble Chart for Keyword Frequencies
    var keywordCounts = data.reduce(function(acc, d) {
        for (var keyword in d.keyword_freq) {
            if (!acc[keyword]) {
                acc[keyword] = 0;
            }
            acc[keyword] += d.keyword_freq[keyword];
        }
        return acc;
    }, {});

    var bubbleData = Object.entries(keywordCounts).map(function(d) {
        return {
            text: d[0],
            size: d[1]
        };
    });

    var bubbleWidth = 800;
    var bubbleHeight = 600;

    var bubbleSvg = d3.select("#keyword-chart svg")
        .attr("width", bubbleWidth + margin.left + margin.right)
        .attr("height", bubbleHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bubbleLayout = d3.pack()
        .size([bubbleWidth, bubbleHeight])
        .padding(1.5);

    var root = d3.hierarchy({
            children: bubbleData
        })
        .sum(function(d) {
            return d.size;
        });

    var node = bubbleSvg.selectAll(".node")
        .data(bubbleLayout(root).leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("circle")
        .attr("r", function(d) {
            return d.r;
        })
        .style("fill", function(d, i) {
            return d3.schemeCategory10[i % 10];
        });

    node.append("text")
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.text;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", function(d) {
            return d.r / 3;
        });

    node.append("title")
        .text(function(d) {
            return d.data.text + ": " + d.data.size;
        });

    // Add legends for colors
    // var legendBubble = bubbleSvg.selectAll(".legend")
    //     .data(d3.schemeCategory10)
    //     .enter().append("g")
    //     .attr("class", "legend")
    //     .attr("transform", function(d, i) {
    //         return "translate(" + (i % 5) * 90 + "," + Math.floor(i / 5) * 20 + ")";
    //     });

    // legendBubble.append("rect")
    //     .attr("x", bubbleWidth - 120)
    //     .attr("y", 0)
    //     .attr("width", 18)
    //     .attr("height", 18)
    //     .style("fill", function(d, i) {
    //         return d3.schemeCategory10[i];
    //     });

    // legendBubble.append("text")
    //     .attr("x", bubbleWidth - 124)
    //     .attr("y", 9)
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "end")
    //     .text(function(d, i) {
    //         return "Category " + (i + 1);
    //     });
});
