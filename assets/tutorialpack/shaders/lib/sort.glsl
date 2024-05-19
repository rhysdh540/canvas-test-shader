struct Pair {
    vec4 color;
    float depth;
};

//NOTE: all algorithms must sort in descending order

void swap(int i, int j, inout Pair arr[6]) {
    if(arr[i].depth < arr[j].depth) {
        Pair temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

// Batcher's odd-even merge sort
void batcherSort6(inout Pair arr[6]) {
    swap(0, 1, arr);
    swap(2, 3, arr);
    swap(4, 5, arr);
    swap(0, 2, arr);
    swap(1, 3, arr);
    swap(0, 4, arr);
    swap(1, 5, arr);
    swap(2, 4, arr);
    swap(3, 5, arr);
    swap(1, 2, arr);
    swap(3, 4, arr);
    swap(1, 4, arr);
    swap(3, 2, arr);
    swap(2, 4, arr);
    swap(1, 3, arr);
}

// Insertion sort
void insertionSort6(inout Pair arr[6]) {
    for(int i = 1; i < 6; i++) {
        Pair key = arr[i];
        int j = i - 1;
        while(j >= 0 && arr[j].depth < key.depth) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

// Selection sort
void selectionSort6(inout Pair arr[6]) {
    for(int i = 0; i < 6; i++) {
        int max = i;
        for(int j = i + 1; j < 6; j++) {
            if(arr[j].depth > arr[max].depth) {
                max = j;
            }
        }
        if(max != i) {
            Pair temp = arr[i];
            arr[i] = arr[max];
            arr[max] = temp;
        }
    }
}

// Bubble sort
void bubbleSort6(inout Pair arr[6]) {
    for(int i = 0; i < 6; i++) {
        for(int j = 0; j < 6 - i - 1; j++) {
            if(arr[j].depth < arr[j + 1].depth) {
                Pair temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

void sort(inout Pair arr[6]) {
//    insertionSort6(arr);
//    selectionSort6(arr);
//    bubbleSort6(arr);
    batcherSort6(arr);
}