# Web application for graph visualization and search using Neo4j and d3.js

This project involves the development of a web application designed for graph visualization and search, utilizing Neo4j and D3.js technologies. The application allows users to create their own graphs and visualize various algorithms through dynamic animations, enhancing the learning and understanding of graph theory concepts.

# Technologies Used:
**Neo4j:** 
A graph database that excels in storing, managing, and querying interconnected data through a graphical model. Utilizing Cypher, a declarative query language, Neo4j simplifies complex data relationships, making it an essential tool across various industries.

**D3.js:**
A JavaScript library for producing dynamic, interactive data visualizations in web browsers. D3.js connects data to DOM elements, enabling real-time responsiveness to user interactions and data updates. Its built-in animations and transitions enhance user engagement and understanding of complex data.

**HTML:** 
The foundational markup language used for structuring web pages, allowing for the organization of various content types.

**CSS:** 
A styling language used to control the visual presentation of web pages, ensuring a clean separation between design and content.

**JavaScript:** 
The programming language that adds interactivity and dynamic behavior to web pages. JavaScript integrates seamlessly with HTML and CSS, enabling real-time content and style updates based on user actions.

# Features:
**Graph Info**  
Display of key information about the current graph, such as:
- Number of vertices and edges
- Degree of each vertex
- Adjacency list
- Incidence and adjacency matrices
- Identification of vertices with the most edges
- Whether the graph is Eulerian  
![gr](https://github.com/user-attachments/assets/23e38582-4a7e-4f44-bfde-f4ca25c43f4e)

**Templates**  
Templates menu with predefined graph structures. Choose from several templates for a quick start, then customize them as needed. This feature is especially useful if you want to avoid creating graphs from scratch. When you select a template, the current graph is replaced by the new structure.  
![t](https://github.com/user-attachments/assets/6f91b03c-b088-4682-8e97-d9ca2501e240)

**Import/Export Graph**  
The Import/Export Graph button allows you to import or export graphs in the Cypher file format.

**Graph Visualization and Interaction**  
Visualization of the graph and interactivity with its elements.  
Application UI and example of a graph:
![1](https://github.com/user-attachments/assets/ff01f5e7-a223-4caf-a704-f732a49f81e8)

Some of the interactions with graph elements:
![22](https://github.com/user-attachments/assets/ccf7b215-0d75-4be9-9f96-626d14a10555)
![33](https://github.com/user-attachments/assets/9c842f2d-180a-4fe7-ad0b-fe5016036304)

# Visualization of the algorithms
Visualize execution of one of these twelve algorithms:

**A\* algorithm:**    
A* finds the shortest path between two nodes by combining the benefits of Dijkstra's algorithm (which guarantees the shortest path) and Greedy Best-First Search (which uses heuristics to guide the search).
It uses both the actual distance from the start node to the current node and an estimate (heuristic) of the distance from the current node to the goal, making it efficient for pathfinding in scenarios like game development and robotics.

**Greedy Best-First Search Algorithm:**  
Greedy Best-First Search (BFS) explores the node that seems closest to the goal (based on a heuristic) without considering the total path length.
It aims to get to the goal as fast as possible but doesn't guarantee the shortest path. It is used in scenarios where speed is more important than optimality, such as simple AI pathfinding.

**Dijkstra's Algorithm:**  
Dijkstra’s algorithm finds the shortest path from a single source node to all other nodes in a weighted graph.
It systematically explores all possible routes, ensuring that the shortest path is found. Dijkstra’s algorithm is widely used in network routing and mapping applications.

Visulization of the Dijkstra's algorithm:  
![dij](https://github.com/user-attachments/assets/aaeb1181-5601-49fa-9115-09b41d25580e)

**Bellman-Ford Algorithm:**  
Bellman-Ford finds the shortest path from a single source node to all other nodes, even in graphs with negative edge weights.
It iterates through all edges multiple times to guarantee the shortest path and can detect negative weight cycles. Bellman-Ford is slower than Dijkstra's but more versatile, making it useful for graphs with fluctuating costs like in financial models.

**Breadth-First Search Algorithm:**  
Breadth-First Search (BFS) explores all nodes layer by layer, starting from a source node and visiting all its neighbors before moving to the next layer.
BFS is useful for unweighted graphs and ensures that the shortest path in terms of the number of edges is found. It’s commonly used in scenarios like finding the shortest path in social networks or in solving puzzles.

Breadth-First Search algorithm during visualization:  
![bfs](https://github.com/user-attachments/assets/5420583b-d7e7-413d-ab70-c51626abe82d)

**Depth-First Search Algorithm:**  
Depth-First Search (DFS) explores as far down a branch as possible before backtracking and trying alternative paths.
It’s useful for searching deeper into a graph, solving mazes, and detecting cycles. DFS is not guaranteed to find the shortest path but is efficient for exploring large graphs where depth matters.

**Kruskal's Algorithm:**  
Kruskal's algorithm finds a Minimum Spanning Tree (MST) for a graph by selecting edges in increasing order of weight and adding them as long as they don’t form a cycle.
It is used to connect all nodes in a graph with the least total edge weight, making it ideal for designing efficient networks like telephone or electrical grids.

Visulization of the Kruskal's algorithm:  
![krus](https://github.com/user-attachments/assets/7aca545b-d9a7-4dc7-b66b-49223e893ef7)

**Prim's Algorithm:**  
Prim's algorithm builds a Minimum Spanning Tree (MST) by starting from any node and progressively adding the smallest edge that connects a new vertex to the growing tree.
It is effective for constructing low-cost networks or pipelines where every node needs to be connected with the minimum total cost.

**Fleury's Algorithm:**  
Fleury’s algorithm finds an Eulerian path or circuit in a graph, which visits every edge exactly once.
It carefully avoids removing bridges (edges that disconnect parts of the graph) until necessary. Fleury's algorithm is used in routing problems where every street (edge) needs to be traversed once, such as mail delivery or garbage collection.

**Hierholzer's Algorithm:**  
Hierholzer's algorithm is used to find an Eulerian circuit by constructing smaller cycles and progressively connecting them until a full circuit is formed.
It is highly efficient for solving Eulerian circuit problems when the graph contains an Eulerian cycle, as used in problems like network flow or circuit design.

**Travelling Salesman Problem - Nearest Neighbor Algorithm:**  
The Nearest Neighbor algorithm for the Travelling Salesman Problem (TSP) finds an approximate solution by starting at a city, visiting the nearest unvisited city, and repeating until all cities are visited.
Though fast, this method often fails to find the optimal path, making it best for smaller datasets or cases where an approximate solution is acceptable.

**Travelling Salesman Problem - Sorted Edges Algorithm:**
The Sorted Edges algorithm for the Travelling Salesman Problem (TSP) sorts all edges by distance and constructs a cycle by adding the shortest possible edges while ensuring no node is visited more than once.
This algorithm provides a better approximation than Nearest Neighbor but is still not guaranteed to find the optimal solution, making it suitable for medium-sized datasets.
